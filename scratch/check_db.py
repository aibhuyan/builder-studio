import sqlite3
import os

db_path = "backend/studio_wars.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("--- TABLES ---")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    print(cursor.fetchall())
    
    print("\n--- CHARACTERS (First 5) ---")
    cursor.execute("SELECT id, name, created_by, status FROM characters LIMIT 5;")
    rows = cursor.fetchall()
    for row in rows:
        print(row)
    
    print("\n--- DISTINCT created_by ---")
    cursor.execute("SELECT DISTINCT created_by FROM characters;")
    print(cursor.fetchall())
    
    conn.close()
else:
    print(f"Database not found at {db_path}")
