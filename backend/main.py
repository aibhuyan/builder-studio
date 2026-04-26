from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine
import models
from routes import characters, admin, health

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Builder Studio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/storage", StaticFiles(directory="storage"), name="storage")

app.include_router(health.router)
app.include_router(characters.router, prefix="/characters", tags=["characters"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
