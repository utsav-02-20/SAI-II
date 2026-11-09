from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.health import router as health_router
from app.api.risk import router as risk_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Python AI/ML Microservice for Disease Risk Scoring, RAG & Clinical Reasoning"
)

# Enable CORS for Express backend and React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(health_router, prefix="", tags=["System Health"])
app.include_router(risk_router, prefix="/api", tags=["Disease Risk & Longevity"])

@app.get("/")
async def root():
    return {
        "message": "ArogyaAI Python Clinical Intelligence Service",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
