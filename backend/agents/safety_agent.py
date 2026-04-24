import os
import json
from typing import AsyncGenerator
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """You are a content safety reviewer for Studio Wars, a game played by all ages.
Screen AI-generated characters for safety, appropriateness, and IP concerns.
Be thorough but fair — dark or edgy characters can still pass. The bar is legal and age-appropriate content."""


async def screen_character(character: dict, original_pitch: str) -> AsyncGenerator[dict, None]:
    yield {"type": "step", "step": "Loading safety checks", "detail": "5 checks to run"}
    yield {"type": "step", "step": "Running content checks", "detail": "Checking harmful content, IP violations, offensive material..."}

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"""Screen this Studio Wars character for safety.

Original pitch: "{original_pitch}"
Character: {json.dumps(character, indent=2)}

Return only a JSON object:
{{
  "score": <0-100, where 100 is perfectly safe>,
  "recommendation": "approve" or "review" or "reject",
  "checks": {{
    "no_harmful_content": {{"passed": true/false, "note": "explanation"}},
    "no_ip_violation": {{"passed": true/false, "note": "explanation"}},
    "no_offensive_name": {{"passed": true/false, "note": "explanation"}},
    "age_appropriate": {{"passed": true/false, "note": "explanation"}},
    "no_real_person_likeness": {{"passed": true/false, "note": "explanation"}}
  }},
  "reasoning": "2-3 sentence overall safety reasoning",
  "flags": ["specific concerns or empty list"]
}}""",
            },
        ],
        temperature=0.1,
        max_tokens=1024,
        response_format={"type": "json_object"},
    )

    result = json.loads(response.choices[0].message.content)
    checks = result.get("checks", {})
    passed = sum(1 for c in checks.values() if c.get("passed"))
    total = len(checks)

    yield {"type": "step", "step": "Checks complete", "detail": f"{passed}/{total} passed — score: {result.get('score')}/100"}
    yield {"type": "step", "step": "Safety verdict", "detail": f"Recommendation: {result.get('recommendation', '').upper()}"}
    yield {"type": "result", "data": result}
