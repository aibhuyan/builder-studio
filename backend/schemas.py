from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class CharacterCreate(BaseModel):
    troop_name: str
    archetype_template: str   # barbarian / giant / archer / wizard / balloon
    target_preference: str    # ground / air / both
    special_ability: str      # splash / rage / freeze / chain / heal
    weakness: str             # low_hp / slow / high_housing / single_target / expensive
    creative_prompt: Optional[str] = None


class AdminDecision(BaseModel):
    decision: str  # approved / rejected
    note: Optional[str] = None


class VoteRequest(BaseModel):
    direction: str  # "up" | "down"
    action: str     # "cast" | "remove"


class VoteResponse(BaseModel):
    id: int
    upvotes: int
    downvotes: int


class CharacterResponse(BaseModel):
    id: int
    pitch: str
    name: Optional[str] = None
    emoji: Optional[str] = None
    type: Optional[str] = None
    rarity: Optional[str] = None
    archetype: Optional[str] = None
    hp: Optional[int] = None
    attack: Optional[int] = None
    defense: Optional[int] = None
    speed: Optional[int] = None
    special: Optional[int] = None
    abilities: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    lore: Optional[str] = None
    backstory: Optional[str] = None
    portrait_url: Optional[str] = None
    glb_url: Optional[str] = None
    glb_status: Optional[str] = None
    rigged_glb_url: Optional[str] = None
    rig_status: Optional[str] = None
    status: str
    ai_score: Optional[float] = None
    ai_recommendation: Optional[str] = None
    ai_checks: Optional[Any] = None
    ai_reasoning: Optional[str] = None
    human_decision: Optional[str] = None
    human_note: Optional[str] = None
    upvotes: int = 0
    downvotes: int = 0
    agent_transcript: Optional[Any] = None
    balance_transcript: Optional[Any] = None
    screening_transcript: Optional[Any] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
