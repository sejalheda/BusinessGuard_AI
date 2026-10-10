import json
import uuid
from typing import Any, Optional
import httpx
from backend.app.llm.base import BaseLLMProvider, LLMResponse, LLMToolCall

class GeminiLLMProvider(BaseLLMProvider):
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")
        self.api_key = api_key
        self.provider_name = "gemini"
        self.model = "gemini-1.5-flash"

    def _convert_tools(self, tools: Optional[list[dict[str, Any]]]) -> list[dict[str, Any]]:
        if not tools:
            return []
        function_declarations = []
        for t in tools:
            function_declarations.append({
                "name": t.get("name"),
                "description": t.get("description", ""),
                "parameters": t.get("inputSchema", {"type": "object", "properties": {}})
            })
        return [{"function_declarations": function_declarations}]

    async def chat(
        self,
        messages: list[dict[str, Any]],
        tools: Optional[list[dict[str, Any]]] = None,
        system_prompt: Optional[str] = None
    ) -> LLMResponse:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        
        contents = []
        for m in messages:
            role = "user" if m.get("role") in ["user", "human"] else "model"
            contents.append({
                "role": role,
                "parts": [{"text": m.get("content", "")}]
            })

        payload: dict[str, Any] = {"contents": contents}
        
        if system_prompt:
            payload["system_instruction"] = {
                "parts": [{"text": system_prompt}]
            }

        converted_tools = self._convert_tools(tools)
        if converted_tools:
            payload["tools"] = converted_tools

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Gemini API returned status {resp.status_code}: {resp.text}")
            
            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise RuntimeError("No candidate response received from Gemini.")

            candidate = candidates[0]
            parts = candidate.get("content", {}).get("parts", [])
            
            text_chunks = []
            tool_calls = []

            for p in parts:
                if "text" in p:
                    text_chunks.append(p["text"])
                if "functionCall" in p:
                    fc = p["functionCall"]
                    tool_calls.append(
                        LLMToolCall(
                            id=f"call_{uuid.uuid4().hex[:8]}",
                            name=fc.get("name"),
                            arguments=fc.get("args", {})
                        )
                    )

            return LLMResponse(
                content=" ".join(text_chunks).strip(),
                tool_calls=tool_calls,
                provider_name="gemini",
                is_fallback=False,
                raw_response=data
            )
