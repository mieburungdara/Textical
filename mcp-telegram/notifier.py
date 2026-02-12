from telegram import Bot
from telegram.error import TelegramError
from telegram.ext import ApplicationBuilder
import os

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8525420361:AAHdjSDZ8YI7ld_OjZ4b35vAltSBlrrDEDs")
CHAT_ID = int(os.getenv("TELEGRAM_CHAT_ID", "6651379178"))

# Create application for v20+ (stores bot internally)
_application = None


async def get_application():
    """Get or create the Application instance for proper v20+ async support."""
    global _application
    if _application is None:
        _application = await ApplicationBuilder().token(BOT_TOKEN).build()
    return _application


async def notify_html(text: str) -> bool:
    """
    Send an HTML-formatted message to the configured Telegram chat.
    
    Args:
        text: The HTML-formatted message to send
        
    Returns:
        True if message was sent successfully, False otherwise
    """
    try:
        application = await get_application()
        await application.bot.send_message(
            chat_id=CHAT_ID,
            text=text,
            parse_mode="HTML",
            disable_web_page_preview=True
        )
        return True
    except TelegramError as e:
        print(f"Telegram notification failed: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error sending notification: {e}")
        return False
