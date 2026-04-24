import sqlite3

conn = sqlite3.connect("studio_wars.db")
try:
    conn.execute("ALTER TABLE characters ADD COLUMN upvotes INTEGER NOT NULL DEFAULT 0")
    print("Added upvotes column")
except Exception as e:
    print(f"upvotes: {e}")

try:
    conn.execute("ALTER TABLE characters ADD COLUMN downvotes INTEGER NOT NULL DEFAULT 0")
    print("Added downvotes column")
except Exception as e:
    print(f"downvotes: {e}")

conn.commit()
conn.close()
print("Migration complete")
