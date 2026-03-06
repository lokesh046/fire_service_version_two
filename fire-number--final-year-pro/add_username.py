import asyncio
from sqlalchemy import text
from shared.database import engine

async def run():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR;"))
            print("Added username column.")
        except Exception as e:
            print("Error adding column:", str(e))
            
        try:
            await conn.execute(text("UPDATE users SET username = split_part(email, '@', 1) WHERE username IS NULL OR username = '';"))
            print("Set default usernames for existing users.")
        except Exception as e:
            print("Error setting username values:", str(e))
            
        try:
            await conn.execute(text("ALTER TABLE users ALTER COLUMN username SET NOT NULL;"))
            print("Set username NOT NULL.")
        except Exception as e:
            print("Error setting NOT NULL:", str(e))
            
        try:
            await conn.execute(text("ALTER TABLE users ADD CONSTRAINT uq_users_username UNIQUE (username);"))
            print("Set username UNIQUE.")
        except Exception as e:
            print("Error setting UNIQUE:", str(e))

if __name__ == "__main__":
    asyncio.run(run())
