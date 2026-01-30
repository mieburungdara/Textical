const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const LISTEN_URL = process.env.LISTEN_URL || 'http://localhost:3000/event';
const AUTHORIZED_USER_ID = process.env.AUTHORIZED_USER_ID;

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not defined in .env file');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('Telegram bot is starting...');

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Security Check: Only allow the authorized user
    if (AUTHORIZED_USER_ID && chatId.toString() !== AUTHORIZED_USER_ID.toString()) {
        console.warn(`Unauthorized access attempt from ID: ${chatId}`);
        bot.sendMessage(chatId, "Unauthorized. This bot is locked to a specific administrator.");
        return;
    }

    if (!text) return;

    // Ignore commands like /start if needed, or handle them
    if (text === '/start') {
        bot.sendMessage(chatId, 'Welcome! I am your Textical Gemini Bridge. Send me a prompt to interact with the system.');
        return;
    }

    console.log(`Forwarding message from ${chatId}: ${text}`);

    try {
        const response = await axios.post(LISTEN_URL, {
            message: text
        });

        const geminiResponse = response.data.response || 'No response from Gemini.';
        
        // Split long messages if necessary (Telegram limit is 4096 chars)
        if (geminiResponse.length > 4000) {
            const chunks = geminiResponse.match(/[-￿]{1,4000}/g) || [];
            for (const chunk of chunks) {
                await bot.sendMessage(chatId, chunk);
            }
        } else {
            bot.sendMessage(chatId, geminiResponse);
        }
    } catch (error) {
        console.error('Error calling listen server:', error.message);
        let errorMessage = 'Error connecting to Gemini CLI.';
        if (error.response && error.response.data && error.response.data.error) {
            errorMessage = `Gemini Error: ${error.response.data.error}\n\n${error.response.data.details || ''}`;
        }
        bot.sendMessage(chatId, errorMessage);
    }
});

bot.on('polling_error', (error) => {
    console.error('Polling error:', error.code);
});
