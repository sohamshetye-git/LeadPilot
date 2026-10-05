import json
import logging
import re
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


def clean_json_response(raw_text: str) -> str:
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


class GeminiClient:
    def __init__(self, api_key: Optional[str] = None):
        self._custom_key = api_key

    def _get_client(self):
        import os
        key = self._custom_key or settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        if not key or not key.strip():
            return None
        try:
            from google import genai
            return genai.Client(api_key=key.strip())
        except Exception as e:
            logger.error(f"Failed to initialize Gemini Client: {e}")
            return None

    @property
    def is_configured(self) -> bool:
        return self._get_client() is not None

    def generate_json(self, prompt: str) -> Optional[Dict[str, Any]]:
        client = self._get_client()
        if not client:
            return None
        
        try:
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "temperature": 0.2
                }
            )
            if not response or not response.text:
                return None
            
            cleaned = clean_json_response(response.text)
            return json.loads(cleaned)
        except Exception as e:
            logger.error(f"Gemini API request failed: {e}")
            return None


gemini_client = GeminiClient()
