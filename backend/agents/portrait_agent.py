import os
import base64
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

PORTRAIT_PROMPT = """A single standalone full-body character portrait isolated on a solid white background: {pitch}

CRITICAL RULES:
1. ONLY ONE CHARACTER. Do not show multiple angles, do not show side views, do not show front/back views.
2. FULL BODY VISIBLE. Show the character from head to toe, centered in the frame.
3. SOLID WHITE BACKGROUND. Pure white only. No scenery, no ground, no shadows, no effects in the background.
4. NO CHARACTER SHEETS. No panels, no frames, no thumbnails, no text. Just one high-quality image.
5. FRONT-FACING. The character should be facing forward.
6. STYLE: High-quality vibrant game-art, clean lines, polished mobile game aesthetic (like Clash of Clans)."""


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
