import json
import uuid
from typing import Any, Optional
import boto3
from backend.app.llm.base import BaseLLMProvider, LLMResponse, LLMToolCall

class BedrockLLMProvider(BaseLLMProvider):
    def __init__(self, region_name: str, model_id: str):
        if not region_name or not model_id:
            raise ValueError("AWS_REGION and BEDROCK_MODEL_ID must be configured.")
        self.region_name = region_name
        self.model_id = model_id
        self.provider_name = "bedrock"
        self.client = boto3.client("bedrock-runtime", region_name=region_name)

    def _convert_tools(self, tools: Optional[list[dict[str, Any]]]) -> Optional[dict[str, Any]]:
        if not tools:
            return None
        tool_specs = []
        for t in tools:
            tool_specs.append({
                "toolSpec": {
                    "name": t.get("name"),
                    "description": t.get("description", ""),
                    "inputSchema": {
                        "json": t.get("inputSchema", {"type": "object", "properties": {}})
                    }
                }
            })
        return {"tools": tool_specs}

    async def chat(
        self,
        messages: list[dict[str, Any]],
        tools: Optional[list[dict[str, Any]]] = None,
        system_prompt: Optional[str] = None
    ) -> LLMResponse:
        # Convert messages to Bedrock Converse format
        bedrock_messages = []
        for m in messages:
            role = "user" if m.get("role") in ["user", "human"] else "assistant"
            bedrock_messages.append({
                "role": role,
                "content": [{"text": m.get("content", "")}]
            })

        converse_params: dict[str, Any] = {
            "modelId": self.model_id,
            "messages": bedrock_messages
        }

        if system_prompt:
            converse_params["system"] = [{"text": system_prompt}]

        tool_config = self._convert_tools(tools)
        if tool_config:
            converse_params["toolConfig"] = tool_config

        # Run synchronous boto3 call in threadpool
        import asyncio
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self.client.converse(**converse_params)
        )

        output = response.get("output", {}).get("message", {})
        content_blocks = output.get("content", [])

        text_chunks = []
        tool_calls = []

        for block in content_blocks:
            if "text" in block:
                text_chunks.append(block["text"])
            if "toolUse" in block:
                tu = block["toolUse"]
                tool_calls.append(
                    LLMToolCall(
                        id=tu.get("toolUseId", f"call_{uuid.uuid4().hex[:8]}"),
                        name=tu.get("name"),
                        arguments=tu.get("input", {})
                    )
                )

        return LLMResponse(
            content=" ".join(text_chunks).strip(),
            tool_calls=tool_calls,
            provider_name="bedrock",
            is_fallback=False,
            raw_response=response
        )
