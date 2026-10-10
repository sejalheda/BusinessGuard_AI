import time
import hashlib
import json
from typing import Any, Optional

class SimpleTTLCache:
    def __init__(self, ttl_seconds: int = 600):  # 10 minutes default
        self.ttl = ttl_seconds
        self.cache: dict[str, tuple[float, Any]] = {}

    def _hash_key(self, key_obj: Any) -> str:
        try:
            serialized = json.dumps(key_obj, sort_keys=True, default=str)
        except Exception:
            serialized = str(key_obj)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    def get(self, key_obj: Any) -> Optional[Any]:
        key = self._hash_key(key_obj)
        entry = self.cache.get(key)
        if not entry:
            return None
        expires_at, value = entry
        if time.time() > expires_at:
            del self.cache[key]
            return None
        return value

    def set(self, key_obj: Any, value: Any, custom_ttl: Optional[int] = None) -> None:
        key = self._hash_key(key_obj)
        ttl = custom_ttl if custom_ttl is not None else self.ttl
        self.cache[key] = (time.time() + ttl, value)

    def clear(self) -> None:
        self.cache.clear()

# Global 10-minute cache instance
request_cache = SimpleTTLCache(ttl_seconds=600)
