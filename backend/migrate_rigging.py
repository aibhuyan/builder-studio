import sqlite3

conn = sqlite3.connect("studio_wars.db")
for col, definition in [
    ("rigged_glb_url", "VARCHAR(500)"),
    ("rig_status",     "VARCHAR(50) DEFAULT 'none'"),
    ("rig_error",      "TEXT"),
]:
    try:
        conn.execute(f"ALTER TABLE characters ADD COLUMN {col} {definition}")
        print(f"Added {col}")
    except Exception as e:
        print(f"{col}: {e}")

conn.commit()
conn.close()
print("Migration complete")
