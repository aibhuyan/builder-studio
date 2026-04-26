import os
import sys
from sqlalchemy import text, create_engine
import re

def get_engine():
    url = os.getenv("DATABASE_URL", "sqlite:///./studio_wars.db")
    # Fix for SQLAlchemy 2.0
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif url.startswith("postgresql://") and "+psycopg2" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    
    # Use 6543 for Supabase pooler if on production
    if "supabase.co" in url and ":5432" in url:
        url = url.replace(":5432", ":6543")
        
    return create_engine(url)

def migrate():
    engine = get_engine()
    print(f"Connecting to database...")
    
    with engine.connect() as conn:
        try:
            # List of columns to check/add
            columns_to_add = [
                ("created_by", "VARCHAR(50)"),
                ("glb_status", "VARCHAR(50) DEFAULT 'none'"),
                ("glb_task_id", "VARCHAR(200)"),
                ("glb_error", "TEXT"),
                ("upvotes", "INTEGER DEFAULT 0"),
                ("downvotes", "INTEGER DEFAULT 0"),
            ]

            for col_name, col_type in columns_to_add:
                try:
                    print(f"Checking for column '{col_name}'...")
                    if "postgresql" in engine.url.drivername:
                        # Postgres check
                        res = conn.execute(text(f"SELECT 1 FROM information_schema.columns WHERE table_name='characters' AND column_name='{col_name}'"))
                        if not res.fetchone():
                            print(f"Adding column '{col_name}' to Postgres...")
                            conn.execute(text(f"ALTER TABLE characters ADD COLUMN {col_name} {col_type}"))
                            conn.commit()
                    else:
                        # SQLite check
                        try:
                            conn.execute(text(f"ALTER TABLE characters ADD COLUMN {col_name} {col_type}"))
                            conn.commit()
                            print(f"Added column '{col_name}' to SQLite.")
                        except Exception:
                            print(f"Column '{col_name}' likely already exists in SQLite.")
                except Exception as e:
                    print(f"Error adding {col_name}: {e}")

            print("Migration successful.")
        except Exception as e:
            print(f"Migration failed: {e}")
            sys.exit(1)

if __name__ == "__main__":
    migrate()
