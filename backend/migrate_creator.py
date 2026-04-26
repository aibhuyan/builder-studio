import sqlite3

conn = sqlite3.connect("studio_wars.db")
try:
    conn.execute("ALTER TABLE characters ADD COLUMN created_by VARCHAR(50)")
    print("Added created_by column")
except Exception as e:
    print(f"created_by: {e}")
conn.commit()
conn.close()
print("Migration complete")
