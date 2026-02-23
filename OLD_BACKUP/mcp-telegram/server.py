from mcp.server.fastmcp import FastMCP
from notifier import notify_html
from formatter import format_notification
from typing import Dict, Any

mcp = FastMCP("telegram-notify")

@mcp.tool()
async def task_done(**payload: Any) -> str:
    """
    Send task completion notification to Telegram
    """
    # Convert keyword arguments to dictionary
    payload_dict = dict(payload)
    
    message = format_notification(payload_dict)
    await notify_html(message)
    return "NOTIFIED"

if __name__ == "__main__":
    mcp.run()
