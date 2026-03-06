import asyncio
import sys
from sqlalchemy import text
from shared.database import engine

async def promote(email_or_username):
    print(f"Attempting to promote '{email_or_username}' to admin...")
    async with engine.begin() as conn:
        try:
            # Check if user exists
            result = await conn.execute(
                text("SELECT id, email, username, role FROM users WHERE email = :identifier OR username = :identifier"),
                {"identifier": email_or_username}
            )
            user = result.fetchone()
            
            if not user:
                print(f"Error: Could not find any user with email or username '{email_or_username}'")
                return

            if user.role == "admin":
                print(f"User {user.username} ({user.email}) is already an admin!")
                return
                
            # Promote to admin
            await conn.execute(
                text("UPDATE users SET role = 'admin' WHERE id = :id"),
                {"id": user.id}
            )
            
            print(f"Success! Upgraded {user.username} ({user.email}) to Admin.")
            print("Please log out and log back in for the changes to take effect.")
            
        except Exception as e:
            print(f"Database error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python promote_admin.py <email_or_username>")
        sys.exit(1)
        
    target = sys.argv[1]
    asyncio.run(promote(target))
