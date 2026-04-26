import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Get the URL from environment variable
url = os.getenv("DATABASE_URL", "sqlite:///./studio_wars.db")

# 1. Strip any accidental whitespace/newlines
url = url.strip()

# 2. Fix the scheme for SQLAlchemy 2.0 + ensure psycopg2 driver is used for Postgres
if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql+psycopg2://", 1)
elif url.startswith("postgresql://"):
    url = url.replace("postgresql://", "postgresql+psycopg2://", 1)

print(f"DEBUG: Database connection starting with: {url[:15]}...")

SQLALCHEMY_DATABASE_URL = url

# SQLite needs connect_args={"check_same_thread": False}, but Postgres doesn't
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
