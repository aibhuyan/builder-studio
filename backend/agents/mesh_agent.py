import os
import asyncio
import httpx
from pathlib import Path
from dotenv import load_dotenv
from storage import download_and_save_mesh
from database import SessionLocal
import models

load_dotenv()

MESHY_API_KEY = os.getenv("MESHY_API_KEY")
MESHY_BASE_URL = "https://api.meshy.ai/openapi/v1"
POLL_INTERVAL = 15  # seconds
MAX_POLLS = 40      # 40 × 15s = 10 min max wait

async def submit_mesh_task(portrait_url: str) -> str:
    headers = {"Authorization": f"Bearer {MESHY_API_KEY}"}
    payload = {
        "image_url": portrait_url,
    }
    async with httpx.AsyncClient() as client:
        print(f"Submitting mesh task for: {portrait_url}")
        response = await client.post(
            f"{MESHY_BASE_URL}/image-to-3d",
            json=payload,
            headers=headers,
            timeout=30.0,
        )
        if response.status_code != 202 and response.status_code != 201 and response.status_code != 200:
            print(f"Meshy Error: {response.status_code} - {response.text}")
        response.raise_for_status()
        result = response.json().get("result")
        print(f"Meshy Task Created: {result}")
        return result


async def poll_mesh_task(task_id: str) -> dict:
    headers = {"Authorization": f"Bearer {MESHY_API_KEY}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{MESHY_BASE_URL}/image-to-3d/{task_id}",
            headers=headers,
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()


async def start_mesh_generation(character_id: int, portrait_url: str):
    db = SessionLocal()
    try:
        character = db.query(models.Character).filter(
            models.Character.id == character_id
        ).first()
        if not character:
            return

        # Submit task to Meshy
        task_id = await submit_mesh_task(portrait_url)
        character.glb_task_id = task_id
        character.glb_status = "generating"
        db.commit()

        # Poll until complete
        for _ in range(MAX_POLLS):
            await asyncio.sleep(POLL_INTERVAL)
            task = await poll_mesh_task(task_id)
            status = task.get("status")

            if status == "SUCCEEDED":
                glb_url = task.get("model_urls", {}).get("glb")
                if glb_url:
                    local_path = await download_and_save_mesh(glb_url)
                    character.glb_url = local_path
                character.glb_status = "ready"
                db.commit()
                return

            if status == "FAILED":
                character.glb_status = "failed"
                character.glb_error = task.get("task_error", {}).get("message", "Unknown error")
                db.commit()
                return

        # Timed out
        character.glb_status = "failed"
        character.glb_error = "Mesh generation timed out after 10 minutes"
        db.commit()

    except Exception as e:
        try:
            character = db.query(models.Character).filter(
                models.Character.id == character_id
            ).first()
            if character:
                character.glb_status = "failed"
                character.glb_error = str(e)
                db.commit()
        except Exception:
            pass
    finally:
        db.close()
