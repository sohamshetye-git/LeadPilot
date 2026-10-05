from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "EventLead AI API"
    API_V1_STR: str = "/api"
    
    # Database - defaults to SQLite for immediate zero-config local run, seamlessly accepts PostgreSQL DATABASE_URL
    DATABASE_URL: str = "sqlite:///./event_leads.db"
    
    # Gemini AI configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    model_config = {
        "env_file": ".env",
        "extra": "allow"
    }


settings = Settings()
