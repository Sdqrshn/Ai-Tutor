from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.auth import router as auth_router
from .api.profile import router as profile_router
from .api.ai_actions import router as ai_router

app = FastAPI()


orgins = ["*", "http://localhost:8080"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=orgins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(ai_router)


@app.get("/")
async def root():
    return {"status": "API running"}
