import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file from project root
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings(BaseModel):
    PROJECT_NAME: str = "BusinessGuard AI"
    VERSION: str = "1.0.0"
    TAGLINE: str = "Your business's first responder."
    SUB_LINE: str = "Hacked, scammed or threatened? Get a calm, step-by-step rescue plan by voice or on screen."
    
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "mock").lower()
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    BEDROCK_MODEL_ID: str = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20241022-v2:0")
    
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    MCP_SERVER_URL: str = os.getenv("MCP_SERVER_URL", "http://127.0.0.1:8001")
    
    DATA_DIR: Path = BASE_DIR / "data"
    DB_PATH: Path = BASE_DIR / os.getenv("DATABASE_PATH", "data/businessguard.db")
    
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

settings = Settings()
