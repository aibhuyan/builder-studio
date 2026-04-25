from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db, SessionLocal
from streaming import sse_stage, sse_step, sse_portrait, sse_done, sse_error
from storage import save_portrait, upload_to_imgbb
import models
import schemas
from agents.portrait_agent import generate_portrait
from agents.character_agent import design_character
from agents.balance_agent import check_balance
from agents.safety_agent import screen_character

router = APIRouter()


@router.post("/generate")
async def generate_character(data: schemas.CharacterCreate):
    async def event_stream():
        db = SessionLocal()
        try:
            pitch_summary = f"{data.troop_name} — {data.archetype_template} | {data.special_ability} ability | weakness: {data.weakness}"
            if data.creative_prompt:
                pitch_summary += f" | {data.creative_prompt}"
            char = models.Character(pitch=pitch_summary, status="draft")
            db.add(char)
            db.commit()
            db.refresh(char)

            transcript = []
            balance_transcript = []
            screening_transcript = []

            # Gather context for agents
            recent_rejections = db.query(models.Character).filter(
                models.Character.status == "rejected",
                models.Character.human_note != None,
            ).order_by(models.Character.created_at.desc()).limit(5).all()
            rejection_context = [
                {"name": c.name, "pitch": c.pitch, "note": c.human_note}
                for c in recent_rejections if c.human_note
            ]

            approved_roster = db.query(models.Character).filter(
                models.Character.status == "approved"
            ).all()
            roster_dicts = [
                {"name": c.name, "type": c.type, "rarity": c.rarity,
                 "hp": c.hp or 0, "attack": c.attack or 0, "defense": c.defense or 0,
                 "speed": c.speed or 0, "special": c.special or 0}
                for c in approved_roster
            ]

            # Stage 1: Portrait
            yield sse_stage("portrait", "Generating character portrait...")
            portrait_context = f"{data.troop_name}, a {data.archetype_template}-type fantasy strategy game troop"
            if data.creative_prompt:
                portrait_context += f". {data.creative_prompt}"
            _, portrait_bytes = await generate_portrait(portrait_context)
            local_path = save_portrait(portrait_bytes)
            try:
                portrait_url = await upload_to_imgbb(portrait_bytes)
            except Exception:
                portrait_url = local_path
            char.portrait_url = portrait_url
            db.commit()
            yield sse_portrait(portrait_url)

            # Stage 2: Character Design
            yield sse_stage("character", "Designing character stats and lore...")
            result = {}
            async for step in design_character(data.model_dump(), rejection_context):
                if step["type"] == "step":
                    transcript.append(step)
                    yield sse_step("character_agent", step["step"], step.get("detail", ""))
                elif step["type"] == "result":
                    result = step["data"]

            char.name = result.get("name")
            char.emoji = result.get("emoji")
            char.type = result.get("type")
            char.rarity = result.get("rarity")
            char.archetype = result.get("archetype")
            char.hp = result.get("hp")
            char.attack = result.get("attack")
            char.defense = result.get("defense")
            char.speed = result.get("speed")
            char.special = result.get("special")
            char.abilities = result.get("abilities")
            char.weaknesses = result.get("weaknesses")
            char.lore = result.get("lore")
            char.backstory = result.get("backstory")
            char.agent_transcript = transcript
            db.commit()

            # Stage 3: Balance Check
            yield sse_stage("balance", "Checking stat balance...")
            async for step in check_balance(result, roster_dicts):
                if step["type"] == "step":
                    balance_transcript.append(step)
                    yield sse_step("balance_agent", step["step"], step.get("detail", ""))

            char.balance_transcript = balance_transcript
            db.commit()

            # Stage 4: Safety Screening
            yield sse_stage("safety", "Running safety screening...")
            screening_result = {}
            async for step in screen_character(result, pitch_summary):
                if step["type"] == "step":
                    screening_transcript.append(step)
                    yield sse_step("safety_agent", step["step"], step.get("detail", ""))
                elif step["type"] == "result":
                    screening_result = step["data"]

            char.ai_score = screening_result.get("score")
            char.ai_recommendation = screening_result.get("recommendation")
            char.ai_checks = screening_result.get("checks")
            char.ai_reasoning = screening_result.get("reasoning")
            char.screening_transcript = screening_transcript
            char.status = "pending_approval"
            db.commit()

            yield sse_done(char.id)

        except Exception as e:
            try:
                char.status = "failed"
                db.commit()
            except Exception:
                pass
            yield sse_error(str(e))
        finally:
            db.close()

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/", response_model=list[schemas.CharacterResponse])
def list_characters(db: Session = Depends(get_db)):
    return db.query(models.Character).filter(
        models.Character.status == "approved"
    ).order_by(
        (models.Character.upvotes - models.Character.downvotes).desc(),
        models.Character.created_at.desc()
    ).all()


@router.get("/{character_id}", response_model=schemas.CharacterResponse)
def get_character(character_id: int, db: Session = Depends(get_db)):
    character = db.query(models.Character).filter(
        models.Character.id == character_id
    ).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return character


@router.post("/{character_id}/vote", response_model=schemas.VoteResponse)
def vote_character(
    character_id: int,
    vote: schemas.VoteRequest,
    db: Session = Depends(get_db),
):
    if vote.direction not in ("up", "down"):
        raise HTTPException(status_code=422, detail="direction must be 'up' or 'down'")
    if vote.action not in ("cast", "remove"):
        raise HTTPException(status_code=422, detail="action must be 'cast' or 'remove'")

    character = db.query(models.Character).filter(
        models.Character.id == character_id,
        models.Character.status == "approved",
    ).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    delta = 1 if vote.action == "cast" else -1
    if vote.direction == "up":
        character.upvotes = max(0, (character.upvotes or 0) + delta)
    else:
        character.downvotes = max(0, (character.downvotes or 0) + delta)

    db.commit()
    db.refresh(character)
    return schemas.VoteResponse(id=character.id, upvotes=character.upvotes, downvotes=character.downvotes)


@router.get("/{character_id}/glb-status")
def get_glb_status(character_id: int, db: Session = Depends(get_db)):
    character = db.query(models.Character).filter(
        models.Character.id == character_id
    ).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return {
        "glb_status": character.glb_status,
        "glb_url": character.glb_url,
        "glb_error": character.glb_error,
    }


@router.get("/{character_id}/rig-status")
def get_rig_status(character_id: int, db: Session = Depends(get_db)):
    character = db.query(models.Character).filter(
        models.Character.id == character_id
    ).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return {
        "rig_status": character.rig_status,
        "rigged_glb_url": character.rigged_glb_url,
        "rig_error": character.rig_error,
    }
