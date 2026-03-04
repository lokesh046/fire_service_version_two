import httpx
import asyncio

async def test_apis():
    payload = {
        "monthly_income": 300000,
        "living_expense": 20000,
        "current_savings": 0,
        "return_rate": 0.10,
        "inflation_rate": 0.06,
        "has_loan": False,
        "loan_emi": 0,
        "loan_years": 0,
        "loan_amount": 0,
        "interest_rate_value": 0,
        "rate_type": "annual",
        "has_insurance": "yes"
    }

    async with httpx.AsyncClient() as client:
        print("--- Testing FIRE Service ---")
        fire_res = await client.post("http://localhost:8001/fire", json=payload)
        print(fire_res.status_code)
        print(fire_res.text)

        print("\n--- Testing Health Service ---")
        payload["fire_number"] = 6000000
        health_res = await client.post("http://localhost:8002/health-score", json=payload)
        print(health_res.status_code)
        print(health_res.text)

if __name__ == "__main__":
    asyncio.run(test_apis())
