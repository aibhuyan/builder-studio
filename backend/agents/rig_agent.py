import os
import asyncio
import httpx
from pathlib import Path
from dotenv import load_dotenv
from storage import download_and_save_mesh
from database import SessionLocal
import models

load_dotenv()

AW_API_KEY = os.getenv("AW_API_KEY")
AW_ANIMATE_URL = "https://api.anything.world/animate"
AW_POLLING_URL = "https://api.anything.world/user-processed-model"

POLL_INTERVAL = 10   # seconds
MAX_POLLS = 72       # 72 × 10s = 12 min max

FINISHED_STAGES = {
    "thumbnails_generation_finished",
    "formats_conversion_finished",
    "migrate_animation_finished",
}


async def submit_rig_task(glb_path: str, model_name: str) -> str:
    data = {
        "key": AW_API_KEY,
        "model_name": model_name,
        "model_type": "",
        "symmetry": "true",
        "auto_rotate": "true",
        "auto_classify": "true",
        "platform": "python",
    }
    filename = Path(glb_path).name
    async with httpx.AsyncClient(timeout=120.0) as client:
        with open(glb_path, "rb") as f:
            response = await client.post(
                AW_ANIMATE_URL,
                data=data,
                files=[("files", (filename, f, "model/gltf-binary"))],
            )
            response.raise_for_status()
            return response.json()["model_id"]


async def poll_rig_task(model_id: str) -> dict:
    params = {"key": AW_API_KEY, "id": model_id, "stage": "done"}
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(AW_POLLING_URL, params=params)
        response.raise_for_status()
        data = response.json()
        if isinstance(data, list):
            data = data[0] if data else {}
        stage = data.get("stage", "")
        return {"done": stage in FINISHED_STAGES, "data": data}


def _extract_glb_url(model_data: dict) -> str | None:
    # Try nested model.mesh.glb
    model = model_data.get("model")
    if isinstance(model, dict):
        mesh = model.get("mesh", {})
        if "glb" in mesh:
            return mesh["glb"]
        if "glb" in model:
            return model["glb"]
    # Try top-level keys
    for key in ("glb", "glb_url", "model_url"):
        if key in model_data:
            return model_data[key]
    return None


async def start_rigging(character_id: int, glb_local_path: str):
    db = SessionLocal()
    try:
        character = db.query(models.Character).filter(
            models.Character.id == character_id
        ).first()
        if not character:
            return

        glb_file = Path(glb_local_path.lstrip("/"))
        if not glb_file.exists():
            character.rig_status = "failed"
            character.rig_error = f"GLB file not found: {glb_local_path}"
            db.commit()
            return

        character.rig_status = "rigging"
        db.commit()

        model_id = await submit_rig_task(str(glb_file), character.name or "character")

        for _ in range(MAX_POLLS):
            await asyncio.sleep(POLL_INTERVAL)
            result = await poll_rig_task(model_id)
            if result["done"]:
                glb_url = _extract_glb_url(result["data"])
                if glb_url:
                    local_path = await download_and_save_mesh(glb_url)
                    character.rigged_glb_url = local_path
                character.rig_status = "ready"
                db.commit()
                return

        character.rig_status = "failed"
        character.rig_error = "Rigging timed out after 12 minutes"
        db.commit()

    except Exception as e:
        try:
            character = db.query(models.Character).filter(
                models.Character.id == character_id
            ).first()
            if character:
                character.rig_status = "failed"
                character.rig_error = str(e)
                db.commit()
        except Exception:
            pass
    finally:
        db.close()
