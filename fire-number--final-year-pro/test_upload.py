import requests
import json
import os

gw_url = "http://127.0.0.1:8008"

# 1. Login
data = {"username": "lokesh1@gmail.com", "password": "loki"}
res = requests.post(f"{gw_url}/auth/login", data=data)
if res.status_code != 200:
    print("Login failed:", res.text)
    exit(1)

token = res.json()["access_token"]
print("Logged in, token:", token[:15] + "...")

# 2. Upload file
with open("test_upload.txt", "w") as f:
    f.write("test document for ingestion with more than 10 characters to pass validation.")

files = {"file": open("test_upload.txt", "rb")}
headers = {"Authorization": f"Bearer {token}"}

res = requests.post(f"{gw_url}/admin/upload", files=files, headers=headers)
print("Upload status:", res.status_code)
print("Upload response:", res.text)
