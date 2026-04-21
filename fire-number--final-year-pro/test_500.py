import requests
import json

try:
    print("Testing /chat/learn on port 8000...")
    r1 = requests.post('http://localhost:8000/chat/learn', json={'query': 'hi'})
    print(f"8000: {r1.status_code} {r1.text}")
except Exception as e:
    print(f"8000 Error: {e}")

try:
    print("Testing /chat/learn on port 8008...")
    r2 = requests.post('http://localhost:8008/chat/learn', json={'query': 'hi'})
    print(f"8008: {r2.status_code} {r2.text}")
except Exception as e:
    print(f"8008 Error: {e}")
