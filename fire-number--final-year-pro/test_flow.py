import httpx
import asyncio
import json

async def test_all():
    payload = {
        "monthly_income": 300000,
        "living_expense": 20000,
        "current_savings": 0,
        "return_rate": 0.10,
        "inflation_rate": 0.06,
        "has_loan": False,
        "loan_emi": 0,
        "loan_years": 0
    }
    
    async with httpx.AsyncClient() as client:
        print("1. Testing FIRE Service directly 8001")
        fire = await client.post("http://localhost:8001/fire", json=payload)
        print("FIRE Response:", fire.status_code, fire.text)
        
        print("\n2. Testing Health Service directly 8002")
        payload["fire_number"] = 6000000
        health = await client.post("http://localhost:8002/health-score", json=payload)
        print("Health Response:", health.status_code, health.text)
        
        print("\n3. Testing Chat Service Chat-Agent 5006")
        chat = await client.post("http://localhost:5006/chat-agent", json={"message": "I earn 300000 per month, spend 20000, have 0 savings, 0 loan."})
        print("Chat Response:", chat.status_code, json.dumps(chat.json(), indent=2))

if __name__ == "__main__":
    asyncio.run(test_all())
