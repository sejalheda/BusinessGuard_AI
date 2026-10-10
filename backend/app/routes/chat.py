from fastapi import APIRouter
from backend.app.models import ChatRequest, ChatResponse
from backend.app.agent import run_agent_loop

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    return await run_agent_loop(
        messages=req.messages,
        case_id=req.case_id,
        context=req.context
    )
