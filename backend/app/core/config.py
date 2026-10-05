from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "LeadPilot API"
    API_V1_STR: str = "/api"
    
    # Database - defaults to SQLite for immediate zero-config local run, seamlessly accepts PostgreSQL DATABASE_URL
    DATABASE_URL: str = "sqlite:///./event_leads.db"
    
    # Gemini AI configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # CORS: Accepts comma-separated list in CORS_ORIGINS or list of strings
    CORS_ORIGINS: Optional[str] = None
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @property
    def cors_origins(self) -> list[str]:
        origins = list(self.BACKEND_CORS_ORIGINS)
        if self.CORS_ORIGINS:
            custom_origins = [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]
            origins.extend(custom_origins)
        return list(set(origins))

    model_config = {
        "env_file": ".env",
        "extra": "allow"
    }


settings = Settings()
