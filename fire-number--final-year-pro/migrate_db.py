import asyncio
from sqlalchemy import text
from shared.database import engine

async def run_migration():
    print("Starting migration...")
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR;"))
            print("Added username column.")
        except Exception as e:
            print("Info: Column may exist:", str(e))
            
        try:
            await conn.execute(text("UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL OR username = '';"))
            print("Updated usernames.")
        except Exception as e:
            print("Error updating:", str(e))
            
        try:
            await conn.execute(text("ALTER TABLE users ALTER COLUMN username SET NOT NULL;"))
            print("Set NOT NULL.")
        except Exception as e:
            print("Error setting NOT NULL:", str(e))
            
        try:
            await conn.execute(text("ALTER TABLE users ADD CONSTRAINT uq_users_username UNIQUE (username);"))
            print("Set UNIQUE constraint.")
        except Exception as e:
            print("Info: Constraint may exist:", str(e))
    print("Migration finished.")

if __name__ == "__main__":
    asyncio.run(run_migration())
