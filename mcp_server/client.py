import httpx
import json
from typing import Any, Optional
from mcp_server.tools import (
    tool_create_case,
    tool_get_case,
    tool_update_case,
    tool_analyze_incident,
    tool_generate_recovery_plan,
    tool_score_business,
    TOOL_DEFINITIONS
)

DIRECT_REGISTRY = {
    "create_case": tool_create_case,
    "get_case": tool_get_case,
    "update_case": tool_update_case,
    "analyze_incident": tool_analyze_incident,
    "generate_recovery_plan": tool_generate_recovery_plan,
    "score_business": tool_score_business,
}

class McpClient:
    def __init__(self, base_url: str = "http://127.0.0.1:8001"):
        self.base_url = base_url.rstrip("/")

    def get_tool_definitions(self) -> list[dict[str, Any]]:
        return TOOL_DEFINITIONS

    async def call_tool_async(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        # Try HTTP call first
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(
                    f"{self.base_url}/call",
                    json={"name": tool_name, "arguments": arguments}
                )
                if res.status_code == 200:
                    data = res.json()
                    return data.get("result", data)
        except Exception:
            # Fall back to direct invocation
            pass

        return self.call_tool_sync(tool_name, arguments)

    def call_tool_sync(self, tool_name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        if tool_name not in DIRECT_REGISTRY:
            return {"error": f"Tool '{tool_name}' unknown."}
        try:
            func = DIRECT_REGISTRY[tool_name]
            return func(**arguments)
        except Exception as e:
            return {"error": f"Tool execution failed: {str(e)}"}

mcp_client = McpClient()
