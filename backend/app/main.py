from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, boards, columns, cards, dashboard, users

app = FastAPI(
    title="TaskFlow API",
    description="Multi-user task management system — FastAPI backend",
    version="1.0.0",
)

# CORS — in production, restrict origins to your frontend domain
# TODO: move allowed origins to environment config before deploying
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(boards.router)
app.include_router(columns.router)
app.include_router(cards.router)
app.include_router(dashboard.router)
app.include_router(users.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "TaskFlow API is running"}
