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
    
    out = ""
    async with httpx.AsyncClient() as client:
        out += "1. Testing FIRE Service directly 8001\n"
        fire = await client.post("http://localhost:8001/fire", json=payload)
        out += f"FIRE Response: {fire.status_code} {fire.text}\n\n"
        
        out += "2. Testing Health Service directly 8002\n"
        payload["fire_number"] = 6000000
        health = await client.post("http://localhost:8002/health-score", json=payload)
        out += f"Health Response: {health.status_code} {health.text}\n\n"
        
        out += "3. Testing Chat Service Chat-Agent 5006\n"
        chat = await client.post("http://localhost:5006/chat-agent", json={"message": "I earn 300000 per month, spend 20000, have 0 savings, 0 loan."})
        out += f"Chat Response: {chat.status_code} {json.dumps(chat.json(), indent=2)}\n\n"

    with open("result.txt", "w") as f:
        f.write(out)

if __name__ == "__main__":
    asyncio.run(test_all())
