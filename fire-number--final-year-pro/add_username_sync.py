import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv("DATABASE_URL")
if db_url and db_url.startswith("postgresql+asyncpg://"):
    db_url = db_url.replace("postgresql+asyncpg://", "postgres://")
if db_url.endswith("?"):
    db_url += "sslmode=require"
elif "?" not in db_url:
    db_url += "?sslmode=require"
else:
    db_url += "&sslmode=require"

print("Connecting to:", db_url)

try:
    conn = psycopg2.connect(db_url)
    conn.autocommit = True
    cur = conn.cursor()

    try:
        cur.execute("ALTER TABLE users ADD COLUMN username VARCHAR;")
        print("Added username column.")
    except Exception as e:
        print("Info/Error adding column:", str(e))

    try:
        cur.execute("UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL OR username = '';")
        print("Set default usernames for existing users.")
    except Exception as e:
        print("Error setting username values:", str(e))

    try:
        cur.execute("ALTER TABLE users ALTER COLUMN username SET NOT NULL;")
        print("Set username NOT NULL.")
    except Exception as e:
        print("Error setting NOT NULL:", str(e))

    try:
        cur.execute("ALTER TABLE users ADD CONSTRAINT uq_users_username UNIQUE (username);")
        print("Set username UNIQUE.")
    except Exception as e:
        print("Info/Error setting UNIQUE:", str(e))

    cur.close()
    conn.close()
    print("Migration Done.")
except Exception as e:
    print("Connection failed:", e)
