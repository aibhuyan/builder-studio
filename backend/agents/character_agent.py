import os
import json
from typing import AsyncGenerator
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT = """You are a game designer for Studio Wars, a mobile strategy game in the style of Clash of Clans.

A player has built a troop using a structured builder. Generate the final troop stats and lore.

RULES:
1. Use the player's troop name EXACTLY as given — do not change it
2. Stats MUST stay strictly within the archetype ranges — never exceed them
3. The chosen weakness MUST push that stat to the LOWER 25% of its range
4. The special ability determines which stats are at the UPPER 50% of range
5. The creative prompt shapes APPEARANCE and LORE only — it does NOT affect stats

ARCHETYPE STAT RANGES (strictly enforced):
- barbarian: hp 150-220, attack 60-80, defense 30-50, speed 65-80, special 10-30
- giant:     hp 350-500, attack 20-40, defense 70-90, speed 20-35, special 10-25
- archer:    hp 100-160, attack 50-70, defense 20-40, speed 60-75, special 30-50
- wizard:    hp 120-180, attack 30-50, defense 25-45, speed 40-60, special 70-90
- balloon:   hp 200-280, attack 40-60, defense 40-60, speed 45-60, special 50-70

TYPE MAPPING (use exactly):
- barbarian → warrior
- giant → tank
- archer → ranger
- wizard → mage
- balloon → support

WEAKNESS RULES (must be visible in stats):
- low_hp: hp at bottom 25% of archetype range
- slow: speed at bottom 25% of archetype range
- high_housing / expensive: no stat penalty — mention in lore/abilities
- single_target: abilities must describe only single-target effects

ABILITY INFLUENCE (push related stats to upper 50% of range):
- splash / freeze / chain: special stat at upper 50%
- rage: attack and speed both at upper 50%
- heal: special at upper 50%, attack at lower 50%

RARITY — determine from combination power:
- wizard + splash or rage → epic / legendary
- giant + freeze or chain → epic
- barbarian / archer with heal or high_housing weakness → common / rare
- most combinations → rare / epic

Return ONLY a valid JSON object with these exact fields:
{
  "name": "<player troop name exactly>",
  "emoji": "one emoji",
  "type": "<from type mapping>",
  "rarity": "common/rare/epic/legendary",
  "archetype": "short creative label (e.g. Frost Sentinel, Lava Crusher)",
  "hp": <integer strictly within archetype range>,
  "attack": <integer strictly within archetype range>,
  "defense": <integer strictly within archetype range>,
  "speed": <integer strictly within archetype range>,
  "special": <integer strictly within archetype range>,
  "abilities": ["<primary ability — based on special_ability choice>", "secondary ability", "passive ability"],
  "weaknesses": ["<primary — reflects chosen weakness>", "secondary weakness"],
  "lore": "2-3 sentences shaped by the creative prompt",
  "backstory": "1-2 sentence origin story"
}"""


async def design_character(form_data: dict, rejection_context: list[dict] | None = None) -> AsyncGenerator[dict, None]:
    yield {"type": "step", "step": "Analyzing selections", "detail": f'Archetype: {form_data["archetype_template"]} · Ability: {form_data["special_ability"]} · Weakness: {form_data["weakness"]}'}
    yield {"type": "step", "step": "Applying stat constraints", "detail": f'Normalizing stats for {form_data["archetype_template"]} archetype...'}

    user_content = f"""Design this troop:
- Name: {form_data["troop_name"]}
- Base archetype: {form_data["archetype_template"]}
- Target preference: {form_data["target_preference"]}
- Special ability: {form_data["special_ability"]}
- Chosen weakness: {form_data["weakness"]}
- Creative vision: {form_data.get("creative_prompt") or "No specific visual direction"}"""

    if rejection_context:
        notes = "\n".join(
            f'- "{r["name"]}" was rejected: "{r["note"]}"'
            for r in rejection_context
        )
        user_content += f"\n\nLearn from these recent director rejections and avoid the same issues:\n{notes}"

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        temperature=0.7,
        max_tokens=1024,
        response_format={"type": "json_object"},
    )

    yield {"type": "step", "step": "Building stats", "detail": "Calculating constrained stat distribution..."}

    raw = response.choices[0].message.content.strip()

    yield {"type": "step", "step": "Writing lore", "detail": "Crafting backstory and abilities..."}

    try:
        result = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Character agent returned invalid JSON: {e}\nRaw: {raw}")

    yield {"type": "step", "step": "Character complete", "detail": f'"{result.get("name")}" — {result.get("rarity")} {result.get("type")}'}
    yield {"type": "result", "data": result}
