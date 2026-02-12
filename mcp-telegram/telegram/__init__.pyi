# Stub for python-telegram-bot module
# This file satisfies type checkers when the actual package is installed

from typing import Any

class Bot:
    def __init__(self, token: str, base_url: str | None = None, proxy_url: str | None = None, proxy_auth: Any | None = None, local_bot_token: bool = True, request: Any | None = None, private_key: bytes | None = None, private_key_password: str = ""): ...
    async def send_message(self, chat_id: int | str, text: str, parse_mode: str | None = None, entities: list[Any] | None = None, disable_web_page_preview: bool | None = None, disable_notification: bool | None = None, protect_content: bool | None = None, message_thread_id: int | None = None, reply_parameters: Any | None = None, reply_markup: Any | None = None, api_kwargs: Any | None = None) -> Any: ...
    # Add other methods as needed
