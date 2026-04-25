from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from agents.mesh_agent import start_mesh_generation
from agents.rig_agent import start_rigging
import models
import schemas

router = APIRouter()


@router.get("/queue", response_model=list[schemas.CharacterResponse])
def get_approval_queue(db: Session = Depends(get_db)):
    return db.query(models.Character).filter(
        models.Character.status == "pending_approval"
    ).order_by(models.Character.created_at.desc()).all()


@router.get("/all", response_model=list[schemas.CharacterResponse])
def get_all_characters(db: Session = Depends(get_db)):
    return db.query(models.Character).order_by(
        models.Character.created_at.desc()
    ).all()


@router.post("/{character_id}/decide", response_model=schemas.CharacterResponse)
async def decide_character(
    character_id: int,
    decision: schemas.AdminDecision,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    character = db.query(models.Character).filter(
        models.Character.id == character_id
    ).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    if character.status != "pending_approval":
        raise HTTPException(status_code=400, detail="Character is not pending approval")

    character.human_decision = decision.decision
    character.human_note = decision.note
    character.status = "approved" if decision.decision == "approved" else "rejected"

    if decision.decision == "approved":
        character.glb_status = "generating"
        db.commit()
        db.refresh(character)
        background_tasks.add_task(start_mesh_generation, character.id, character.portrait_url)
    else:
        db.commit()
        db.refresh(character)

    return character


@router.post("/{character_id}/retry-mesh", response_model=schemas.CharacterResponse)
async def retry_mesh(
    character_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    character = db.query(models.Character).filter(
        models.Character.id == character_id
    ).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    if character.status != "approved":
        raise HTTPException(status_code=400, detail="Character is not approved")
    if not character.portrait_url:
        raise HTTPException(status_code=400, detail="Character has no portrait URL")

    character.glb_status = "generating"
    character.glb_error = None
    character.glb_url = None
    db.commit()
    db.refresh(character)
    background_tasks.add_task(start_mesh_generation, character.id, character.portrait_url)
    return character


@router.post("/{character_id}/retry-rig", response_model=schemas.CharacterResponse)
async def retry_rig(
    character_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    character = db.query(models.Character).filter(
        models.Character.id == character_id
    ).first()
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    if character.status != "approved":
        raise HTTPException(status_code=400, detail="Character is not approved")
    if not character.glb_url:
        raise HTTPException(status_code=400, detail="Character has no GLB — generate mesh first")

    character.rig_status = "rigging"
    character.rig_error = None
    character.rigged_glb_url = None
    db.commit()
    db.refresh(character)
    background_tasks.add_task(start_rigging, character.id, character.glb_url)
    return character
