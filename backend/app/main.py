from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.session import engine, Base
from app.api.leads import router as leads_router
from app.api.events import router as events_router
from app.api.follow_ups import router as follow_ups_router
from app.api.dashboard import router as dashboard_router
from app.api.ai import router as ai_router

# Ensure tables are created automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade AI-powered event lead management platform API",
    version="1.0.0"
)

# CORS setup - supports local dev and custom CORS_ORIGINS from production env
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import logging
    logging.getLogger("uvicorn.error").error(f"Global exception caught: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. Please try again shortly."}
    )

# Routers
app.include_router(leads_router, prefix=settings.API_V1_STR)
app.include_router(events_router, prefix=settings.API_V1_STR)
app.include_router(follow_ups_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)


@app.get("/health")
def health_check():
    db_status = "connected"
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception:
        db_status = "unavailable"
    
    return {
        "status": "ok",
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "database": db_status
    }
