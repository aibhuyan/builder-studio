import os
import uuid
import base64
import httpx
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

PORTRAITS_DIR = Path("storage/portraits")
MESHES_DIR = Path("storage/meshes")

IMGBB_API_KEY = os.getenv("IMGBB_API_KEY")


def save_portrait(image_bytes: bytes, extension: str = "png") -> str:
    filename = f"{uuid.uuid4()}.{extension}"
    path = PORTRAITS_DIR / filename
    path.write_bytes(image_bytes)
    return f"/storage/portraits/{filename}"


async def upload_to_imgbb(image_bytes: bytes) -> str:
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.imgbb.com/1/upload",
            data={"key": IMGBB_API_KEY, "image": b64},
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()["data"]["url"]


async def download_and_save_mesh(url: str) -> str:
    filename = f"{uuid.uuid4()}.glb"
    path = MESHES_DIR / filename
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=60.0)
        response.raise_for_status()
        path.write_bytes(response.content)
    return f"/storage/meshes/{filename}"
