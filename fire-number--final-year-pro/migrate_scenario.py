import asyncio
from sqlalchemy import text
from shared.database import engine

async def run():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE fire_calculations ADD COLUMN IF NOT EXISTS scenario_name VARCHAR DEFAULT 'Primary Goal';"))
            print("Successfully added scenario_name column.")
        except Exception as e:
            print("Error adding column:", e)

if __name__ == "__main__":
    asyncio.run(run())
