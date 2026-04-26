import os
import sys
from sqlalchemy import text
from database import engine

def migrate():
    print(f"Connecting to: {engine.url.drivername}")
    with engine.connect() as conn:
        try:
            print("Attempting to add 'created_by' column if it doesn't exist...")
            # For Postgres, we can use a DO block or just try and catch
            if "postgresql" in engine.url.drivername:
                conn.execute(text("""
                    DO $$ 
                    BEGIN 
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='characters' AND column_name='created_by') THEN
                            ALTER TABLE characters ADD COLUMN created_by VARCHAR(50);
                        END IF;
                    END $$;
                """))
            else:
                # SQLite
                try:
                    conn.execute(text("ALTER TABLE characters ADD COLUMN created_by VARCHAR(50)"))
                except:
                    print("Column might already exist in SQLite")
            
            conn.commit()
            print("Migration check complete.")
        except Exception as e:
            print(f"Error during migration: {e}")
            sys.exit(1)

if __name__ == "__main__":
    migrate()
