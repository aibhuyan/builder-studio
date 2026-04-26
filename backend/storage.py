import os
import uuid
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = "builder-studio"


async def upload_to_supabase(folder: str, filename: str, content: bytes, content_type: str) -> str:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in .env")

    # Ensure URL doesn't have a trailing slash
    base_url = SUPABASE_URL.rstrip('/')
    
    url = f"{base_url}/storage/v1/object/{SUPABASE_BUCKET}/{folder}/{filename}"
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": content_type
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, content=content, headers=headers, timeout=60.0)
        # If the file already exists or there is an error, this will raise an exception
        response.raise_for_status()

    # Return the public URL
    return f"{base_url}/storage/v1/object/public/{SUPABASE_BUCKET}/{folder}/{filename}"


async def download_and_save_mesh(url: str) -> str:
    filename = f"{uuid.uuid4()}.glb"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=60.0)
        response.raise_for_status()
        mesh_bytes = response.content
        
    return await upload_to_supabase("meshes", filename, mesh_bytes, "model/gltf-binary")
