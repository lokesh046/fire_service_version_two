import os
import hashlib
import json
import re
import asyncio
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = "gemini-2.5-flash"

LLM_CACHE = {}

async def generate_explanation(prompt: str):
    """
    Calls Gemini and returns structured output compatible with FastAPI response model.
    """
    cache_key = hashlib.sha256(prompt.encode()).hexdigest()

    if cache_key in LLM_CACHE:
        return LLM_CACHE[cache_key]
        
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        system_instructions = (
            "You are a professional financial advisor.\n"
            "Return STRICT JSON only with this structure:\n"
            "{\n"
            "  \"summary\": \"string\",\n"
            "  \"reasoning_points\": [\"string\"],\n"
            "  \"risk_note\": \"string\"\n"
            "}"
        )
        
        raw_output = ""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await client.aio.models.generate_content(
                    model=MODEL_NAME,
                    contents=system_instructions + "\n\nUser Prompt: " + prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.3
                    )
                )
                raw_output = response.text.strip()
                break
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"LLM Exception: {str(e)}. Retrying {attempt+1}/{max_retries}...")
                    await asyncio.sleep(2 ** attempt)
                else:
                    raise e
        
        if raw_output.startswith("```"):
            raw_output = re.sub(r"^```json", "", raw_output)
            raw_output = re.sub(r"^```", "", raw_output)
            raw_output = re.sub(r"```$", "", raw_output)
            raw_output = raw_output.strip()

        try:
            structured_output = json.loads(raw_output)
        except json.JSONDecodeError:
            print("JSON parse failed. Raw output:", raw_output)
            structured_output = {
                "summary": raw_output,
                "reasoning_points": [],
                "risk_note": ""
            }

        structured_output.setdefault("summary", "")
        structured_output.setdefault("reasoning_points", [])
        structured_output.setdefault("risk_note", "")

        normalized_points = []
        for point in structured_output["reasoning_points"]:
            if isinstance(point, dict):
                key_point = point.get("key_point", "")
                context = point.get("context", "")
                combined = f"{key_point} {context}".strip()
                normalized_points.append(combined)
            else:
                normalized_points.append(str(point))

        structured_output["reasoning_points"] = normalized_points

        if isinstance(structured_output["risk_note"], dict):
            explanation = structured_output["risk_note"].get("explanation", "")
            suggested_action = structured_output["risk_note"].get("suggested_action", "")
            structured_output["risk_note"] = f"{explanation} {suggested_action}".strip()
        else:
            structured_output["risk_note"] = str(structured_output["risk_note"])

        final_output = {
            "summary": str(structured_output["summary"]),
            "reasoning_points": structured_output["reasoning_points"],
            "risk_note": structured_output["risk_note"]
        }

        LLM_CACHE[cache_key] = final_output
        return final_output

    except Exception as e:
        print("LLM Exception:", str(e))
        return _fallback_response()






def _fallback_response():
    return {
        "summary": "AI explanation temporarily unavailable.",
        "reasoning_points": [],
        "risk_note": ""
    }

async def generate_raw_text(prompt: str) -> str:
    """
    Calls Gemini and returns raw text output for general Q&A.
    """
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await client.aio.models.generate_content(
                    model=MODEL_NAME,
                    contents=prompt,
                )
                return response.text.strip()
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"LLM Exception in raw text: {str(e)}. Retrying {attempt+1}/{max_retries}...")
                    await asyncio.sleep(2 ** attempt)
                else:
                    raise e
    except Exception as e:
        print("LLM Exception in raw text:", str(e))
        return "Sorry, I'm having trouble analyzing the financial documents right now. Please try again later."