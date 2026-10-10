import logging
from typing import Any, Optional
from backend.app.config import settings
from backend.app.llm.base import BaseLLMProvider, LLMResponse
from backend.app.llm.mock_provider import MockLLMProvider
from backend.app.llm.gemini_provider import GeminiLLMProvider
from backend.app.llm.bedrock_provider import BedrockLLMProvider

logger = logging.getLogger("businessguard.llm")

class SafeLLMProvider(BaseLLMProvider):
    """
    Wraps provider resolution with automatic, transparent fallback to MockProvider
    whenever credentials are empty or remote requests raise errors.
    """
    def __init__(self):
        self.requested_provider = settings.LLM_PROVIDER.lower()
        self.mock_provider = MockLLMProvider()
        self.active_provider: Optional[BaseLLMProvider] = None

        if self.requested_provider == "gemini":
            if settings.GEMINI_API_KEY:
                try:
                    self.active_provider = GeminiLLMProvider(api_key=settings.GEMINI_API_KEY)
                except Exception as e:
                    logger.warning(f"Failed to initialize Gemini provider: {e}. Falling back to mock.")
            else:
                logger.info("GEMINI_API_KEY not configured. Falling back to mock provider.")
        elif self.requested_provider == "bedrock":
            try:
                self.active_provider = BedrockLLMProvider(
                    region_name=settings.AWS_REGION,
                    model_id=settings.BEDROCK_MODEL_ID
                )
            except Exception as e:
                logger.warning(f"Failed to initialize Bedrock provider: {e}. Falling back to mock.")
        else:
            self.active_provider = self.mock_provider

    async def chat(
        self,
        messages: list[dict[str, Any]],
        tools: Optional[list[dict[str, Any]]] = None,
        system_prompt: Optional[str] = None
    ) -> LLMResponse:
        # If no active provider or mock selected, use mock directly
        if not self.active_provider or self.requested_provider == "mock":
            return await self.mock_provider.chat(messages, tools, system_prompt)

        # Attempt call on primary chosen provider
        try:
            resp = await self.active_provider.chat(messages, tools, system_prompt)
            return resp
        except Exception as e:
            logger.error(
                f"Error with LLM provider '{self.requested_provider}': {str(e)}. "
                "Automatically engaging graceful fallback to mock provider."
            )
            fallback_resp = await self.mock_provider.chat(messages, tools, system_prompt)
            fallback_resp.is_fallback = True
            return fallback_resp

# Global provider instance
llm_provider = SafeLLMProvider()
