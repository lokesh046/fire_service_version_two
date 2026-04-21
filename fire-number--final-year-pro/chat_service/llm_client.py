# chat_service/llm_client.py

import re
import os
import json
import asyncio
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai import errors

load_dotenv()


class LLMClient:

    def __init__(self):
        self.client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY")
        )

    # -------------------------------------------------
    # 1️⃣ Extract JSON (Used by Interpreter)
    # -------------------------------------------------
    async def extract_json(self, prompt: str):
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await self.client.aio.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0
                    )
                )

                text = response.text

                # 🔥 REMOVE markdown code blocks if present
                if text.startswith("```"):
                    text = re.sub(r"```json", "", text)
                    text = re.sub(r"```", "", text)
                    text = text.strip()

                # Now safely parse
                return json.loads(text)
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"Error extracting json: {e}. Retrying in {2 ** attempt} seconds...")
                    await asyncio.sleep(2 ** attempt)
                else:
                    raise

    # -------------------------------------------------
    # 2️⃣ Generate Plain Text (Used by Explanation Layer)
    # -------------------------------------------------
    async def generate_text(self, prompt: str):
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await self.client.aio.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.7
                    )
                )

                return response.text
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"Error generating text: {e}. Retrying in {2 ** attempt} seconds...")
                    await asyncio.sleep(2 ** attempt)
                else:
                    raise