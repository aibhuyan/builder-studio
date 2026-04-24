import os
import asyncio
import base64
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def main():
    print("Testing OpenAI text (gpt-4o-mini)...")
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Say hello in one sentence."}],
        max_tokens=50,
    )
    print("Text OK:", response.choices[0].message.content)

    print("\nTesting image generation (dall-e-3)...")
    response = await client.images.generate(
        model="dall-e-3",
        prompt="A fantasy warrior character, digital art.",
        n=1,
        size="1024x1024",
        quality="standard",
        response_format="b64_json",
    )
    image_bytes = base64.b64decode(response.data[0].b64_json)
    print("Image OK — received", len(image_bytes), "bytes")


asyncio.run(main())
