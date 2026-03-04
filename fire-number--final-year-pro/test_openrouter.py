import httpx
import os
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("OPENROUTER_API_KEY")
print("KEY LOADED:", key)

response = httpx.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    json={
        "model": "mistralai/mistral-7b-instruct",
        "messages": [{"role": "user", "content": "hello"}]
    }
)

print("STATUS:", response.status_code)
print("TEXT:", response.text)
