import os
import json
from typing import AsyncGenerator
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def execute_check_stat_total(hp, attack, defense, speed, special, rarity) -> dict:
    total = (hp // 10) + attack + defense + speed + special
    thresholds = {
        "legendary": (260, 280),
        "epic": (230, 260),
        "rare": (200, 240),
        "common": (150, 190),
    }
    low, high = thresholds.get(rarity.lower(), (150, 280))
    passed = low <= total <= high
    return {
        "total": total,
        "expected_range": f"{low}-{high}",
        "passed": passed,
        "detail": f"Stat total {total} {'within' if passed else 'outside'} expected range {low}-{high} for {rarity}",
    }


def execute_check_type_alignment(type, attack, defense, speed, hp, special) -> dict:
    issues = []
    if type == "tank" and max(defense, hp // 10) < max(attack, speed, special):
        issues.append("Tank should have highest defense or hp")
    if type == "assassin" and max(attack, speed) < max(defense, hp // 10, special):
        issues.append("Assassin should have highest attack or speed")
    if type == "mage" and special < max(attack, defense, speed):
        issues.append("Mage should have highest special stat")
    if type == "support" and max(special, speed) < max(attack, defense):
        issues.append("Support should have highest special or speed")
    passed = len(issues) == 0
    return {
        "passed": passed,
        "issues": issues,
        "detail": "Type alignment looks good" if passed else "; ".join(issues),
    }


def execute_check_roster_balance(character: dict, roster: list[dict]) -> dict:
    if not roster:
        return {"passed": True, "detail": "No existing characters to compare against", "roster_size": 0}

    def total(c):
        return (c.get("hp", 0) // 10) + c.get("attack", 0) + c.get("defense", 0) + c.get("speed", 0) + c.get("special", 0)

    char_total = total(character)
    same_rarity = [c for c in roster if c.get("rarity") == character.get("rarity")]
    same_type = [c for c in roster if c.get("type") == character.get("type")]
    issues = []

    if same_rarity:
        avg = sum(total(c) for c in same_rarity) / len(same_rarity)
        deviation = abs(char_total - avg) / avg * 100 if avg > 0 else 0
        if deviation > 15:
            issues.append(f"Stat total {char_total} deviates {deviation:.0f}% from {character.get('rarity')} roster average ({avg:.0f})")

    if len(same_type) >= 3:
        issues.append(f"Roster already has {len(same_type)} {character.get('type')} characters — low type diversity")

    passed = len(issues) == 0
    return {
        "passed": passed,
        "issues": issues,
        "roster_size": len(roster),
        "same_rarity_count": len(same_rarity),
        "detail": "Fits well within the current roster" if passed else "; ".join(issues),
    }


async def check_balance(character: dict, roster: list[dict] | None = None) -> AsyncGenerator[dict, None]:
    roster = roster or []
    yield {"type": "step", "step": "Running stat total check", "detail": f"Rarity: {character.get('rarity')}"}

    stat_result = execute_check_stat_total(
        hp=character.get("hp", 0),
        attack=character.get("attack", 0),
        defense=character.get("defense", 0),
        speed=character.get("speed", 0),
        special=character.get("special", 0),
        rarity=character.get("rarity", "common"),
    )
    yield {"type": "step", "step": "Stat total result", "detail": stat_result["detail"]}

    yield {"type": "step", "step": "Running type alignment check", "detail": f"Type: {character.get('type')}"}

    alignment_result = execute_check_type_alignment(
        type=character.get("type", "warrior"),
        attack=character.get("attack", 0),
        defense=character.get("defense", 0),
        speed=character.get("speed", 0),
        hp=character.get("hp", 0),
        special=character.get("special", 0),
    )
    yield {"type": "step", "step": "Type alignment result", "detail": alignment_result["detail"]}

    yield {"type": "step", "step": "Running roster balance check", "detail": f"Comparing against {len(roster)} approved characters"}

    roster_result = execute_check_roster_balance(character, roster)
    yield {"type": "step", "step": "Roster balance result", "detail": roster_result["detail"]}

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": f"""You are a game balance expert. Give a final balance verdict.

Character: {json.dumps(character, indent=2)}
Stat check: {json.dumps(stat_result)}
Type alignment: {json.dumps(alignment_result)}
Roster balance: {json.dumps(roster_result)}

Return only a JSON object:
{{
  "balanced": true/false,
  "confidence": <0-100>,
  "flags": ["balance concerns or empty list"],
  "verdict": "one sentence summary"
}}""",
            }
        ],
        temperature=0.2,
        max_tokens=512,
        response_format={"type": "json_object"},
    )

    verdict = json.loads(response.choices[0].message.content)
    yield {"type": "step", "step": "Balance verdict", "detail": verdict.get("verdict", "")}
    yield {
        "type": "result",
        "data": {"stat_check": stat_result, "alignment_check": alignment_result, "roster_check": roster_result, "verdict": verdict},
    }
