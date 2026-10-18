import asyncio
import json
from typing import Any
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from mcp_server.tools import (
    tool_create_case,
    tool_get_case,
    tool_update_case,
    tool_analyze_incident,
    tool_generate_recovery_plan,
    tool_check_payment_screenshot,
    tool_score_business,
    TOOL_DEFINITIONS
)

mcp_app = FastAPI(
    title="BusinessGuard MCP Server",
    description="Official Model Context Protocol server exposing security and incident recovery tools for small business protection.",
    version="1.0.0"
)

mcp_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registry of callable tools
TOOL_REGISTRY = {
    "create_case": tool_create_case,
    "get_case": tool_get_case,
    "update_case": tool_update_case,
    "analyze_incident": tool_analyze_incident,
    "generate_recovery_plan": tool_generate_recovery_plan,
    "check_payment_screenshot": tool_check_payment_screenshot,
    "score_business": tool_score_business,
}

@mcp_app.get("/")
def root():
    return {
        "server": "BusinessGuard MCP Server",
        "protocol": "Model Context Protocol (MCP) Streamable HTTP",
        "version": "1.0.0",
        "tools_url": "/mcp/tools",
        "sse_url": "/sse",
        "status": "online"
    }

@mcp_app.get("/health")
def health():
    return {"status": "ok", "tools_count": len(TOOL_DEFINITIONS)}

@mcp_app.get("/mcp/tools")
@mcp_app.get("/tools")
def list_tools():
    """List all available tools with full JSON schemas following the MCP specification."""
    return {
        "tools": TOOL_DEFINITIONS
    }

@mcp_app.post("/call")
async def call_tool(request: Request):
    """Execute an MCP tool by name with JSON arguments."""
    payload = await request.json()
    tool_name = payload.get("name")
    arguments = payload.get("arguments", {})
    
    if not tool_name or tool_name not in TOOL_REGISTRY:
        raise HTTPException(
            status_code=404,
            detail=f"Tool '{tool_name}' not found. Available tools: {list(TOOL_REGISTRY.keys())}"
        )
        
    func = TOOL_REGISTRY[tool_name]
    try:
        # Call tool with unpacked arguments
        result = func(**arguments)
        return {
            "content": [
                {
                    "type": "text",
                    "text": json.dumps(result, indent=2)
                }
            ],
            "result": result,
            "tool": tool_name
        }
    except TypeError as te:
        raise HTTPException(status_code=400, detail=f"Invalid arguments for {tool_name}: {str(te)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution error in {tool_name}: {str(e)}")

# Standard MCP SSE endpoint for MCP clients
@mcp_app.get("/sse")
async def sse_endpoint(request: Request):
    """MCP streamable SSE endpoint for external MCP clients."""
    from fastapi.responses import StreamingResponse
    async def event_generator():
        yield f"event: endpoint\ndata: /messages?sessionId=bg-session-1\n\n"
        # Keepalive ping
        while True:
            await asyncio.sleep(15)
            yield f": ping\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run("mcp_server.server:mcp_app", host="127.0.0.1", port=8001, reload=True)
