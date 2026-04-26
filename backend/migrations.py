from sqlalchemy import text
from database import engine

def run_migrations():
    print("Running database migrations...")
    with engine.connect() as conn:
        # Columns to check and add if missing
        columns = [
            ("created_by", "VARCHAR(50)"),
            ("glb_status", "VARCHAR(50) DEFAULT 'none'"),
            ("glb_task_id", "VARCHAR(200)"),
            ("glb_error", "TEXT"),
            ("upvotes", "INTEGER DEFAULT 0"),
            ("downvotes", "INTEGER DEFAULT 0"),
        ]
        
        for col_name, col_type in columns:
            try:
                if "postgresql" in engine.url.drivername:
                    # Postgres IF NOT EXISTS check
                    conn.execute(text(f"""
                        DO $$ 
                        BEGIN 
                            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='characters' AND column_name='{col_name}') THEN
                                ALTER TABLE characters ADD COLUMN {col_name} {col_type};
                            END IF;
                        END $$;
                    """))
                else:
                    # SQLite simple try-catch
                    try:
                        conn.execute(text(f"ALTER TABLE characters ADD COLUMN {col_name} {col_type}"))
                    except:
                        pass # Column already exists
                conn.commit()
            except Exception as e:
                print(f"Error migrating column {col_name}: {e}")
    print("Migrations complete.")
