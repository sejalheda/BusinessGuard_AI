from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import init_db
from backend.app.routes import cases, chat, alexa, audit, emergency, mcp_routes, payment
from mcp_server.tools import TOOL_DEFINITIONS

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and seed initial sample cases if needed
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Your business's first responder. Prototype emergency rescue and security guidance for small online merchants.",
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(cases.router)
app.include_router(chat.router)
app.include_router(alexa.router)
app.include_router(audit.router)
app.include_router(emergency.router)
app.include_router(mcp_routes.router)
app.include_router(payment.router)

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "sub_line": settings.SUB_LINE,
        "provider": settings.LLM_PROVIDER,
        "status": "ready",
        "prototype": True,
        "simulator": "Alexa+ simulated"
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "llm_provider": settings.LLM_PROVIDER,
        "tools_count": len(TOOL_DEFINITIONS)
    }

# Also support /mcp/tools directly on port 8000
@app.get("/mcp/tools")
def direct_mcp_tools():
    return {
        "server": "BusinessGuard MCP Server",
        "tools": TOOL_DEFINITIONS
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
