from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.sql import func
from database import Base


class Character(Base):
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, index=True)
    pitch = Column(Text, nullable=False)
    created_by = Column(String(50))

    # Identity
    name = Column(String(100))
    emoji = Column(String(10))
    type = Column(String(50))
    rarity = Column(String(50))
    archetype = Column(String(100))

    # Stats
    hp = Column(Integer)
    attack = Column(Integer)
    defense = Column(Integer)
    speed = Column(Integer)
    special = Column(Integer)

    # Lore
    abilities = Column(JSON)
    weaknesses = Column(JSON)
    lore = Column(Text)
    backstory = Column(Text)

    # Assets
    portrait_url = Column(String(500))
    glb_url = Column(String(500))
    glb_status = Column(String(50), default="none")  # none/generating/ready/failed
    glb_task_id = Column(String(200))
    glb_error = Column(Text)

    # Pipeline status
    status = Column(String(50), default="draft")
    # draft → generated → pending_approval → approved / rejected

    # AI Screening
    ai_score = Column(Float)
    ai_recommendation = Column(String(50))
    ai_checks = Column(JSON)
    ai_reasoning = Column(Text)

    # Human Approval
    human_decision = Column(String(50))
    human_note = Column(Text)

    # Community Voting
    upvotes = Column(Integer, default=0, nullable=False, server_default="0")
    downvotes = Column(Integer, default=0, nullable=False, server_default="0")

    # Trust Layer — full transcripts
    agent_transcript = Column(JSON)
    balance_transcript = Column(JSON)
    screening_transcript = Column(JSON)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
