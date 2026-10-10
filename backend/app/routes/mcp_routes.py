from fastapi import APIRouter, Request, HTTPException
from mcp_server.tools import TOOL_DEFINITIONS, get_connection
from mcp_server.client import mcp_client

router = APIRouter(prefix="/api/mcp", tags=["mcp"])

@router.get("/tools")
def get_mcp_tools():
    """Return all available MCP tools with their JSON schemas following the Model Context Protocol specification."""
    return {
        "server": "BusinessGuard MCP Server",
        "protocol_version": "2024-11-05",
        "tools": TOOL_DEFINITIONS
    }

@router.post("/execute")
async def execute_mcp_tool(request: Request):
    """Directly test or execute an MCP tool from the UI with custom parameters."""
    body = await request.json()
    name = body.get("name")
    arguments = body.get("arguments", {})
    
    if not name:
        raise HTTPException(status_code=400, detail="Tool 'name' is required.")
        
    result = await mcp_client.call_tool_async(name, arguments)
    return {
        "tool": name,
        "arguments": arguments,
        "result": result
    }
