from telegram import Bot
import os

BOT_TOKEN = "8525420361:AAHdjSDZ8YI7ld_OjZ4b35vAltSBlrrDEDs"
CHAT_ID = 6651379178

bot = Bot(BOT_TOKEN)

async def notify_html(text: str):
    await bot.send_message(
        chat_id=CHAT_ID,
        text=text,
        parse_mode="HTML",
        disable_web_page_preview=True
    )
