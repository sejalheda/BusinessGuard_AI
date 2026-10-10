from abc import ABC, abstractmethod
from typing import Any, Optional
from pydantic import BaseModel, Field

class LLMToolCall(BaseModel):
    id: str
    name: str
    arguments: dict[str, Any]

class LLMResponse(BaseModel):
    content: str
    tool_calls: list[LLMToolCall] = Field(default_factory=list)
    provider_name: str
    is_fallback: bool = False
    raw_response: Optional[Any] = None

class BaseLLMProvider(ABC):
    @abstractmethod
    async def chat(
        self,
        messages: list[dict[str, Any]],
        tools: Optional[list[dict[str, Any]]] = None,
        system_prompt: Optional[str] = None
    ) -> LLMResponse:
        """Execute chat completion with tool calling capability."""
        pass
