import os
import base64
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

PORTRAIT_PROMPT = """Single full-body character portrait for a 3D model reference: {pitch}

Requirements:
- ONE character only, centered, full body visible from head to toe
- Plain light grey or white background — no scenery, no environment, no shadows on ground
- Character faces forward (front-facing pose), arms slightly away from body
- No text, no UI, no frames, no panels, no thumbnails, no multiple views, no character sheets
- Clean silhouette with no overlapping elements — essential for 3D mesh conversion
- Style: vibrant game-art illustration, Clash of Clans / mobile strategy game aesthetic
- High detail on armor, weapons, and costume"""


async def generate_portrait(pitch: str) -> tuple[str, bytes]:
    prompt = PORTRAIT_PROMPT.format(pitch=pitch)

    response = await client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        n=1,
        size="1024x1024",
        quality="standard",
        response_format="b64_json",
    )

    b64 = response.data[0].b64_json
    image_bytes = base64.b64decode(b64)
    data_url = f"data:image/png;base64,{b64}"
    return data_url, image_bytes
