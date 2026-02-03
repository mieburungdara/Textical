const https = require('https');

// Use environment variables for security
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

const sendMessage = (msg) => {
    const data = JSON.stringify({
        chat_id: CHAT_ID,
        text: msg,
        parse_mode: 'HTML'
    });

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', responseData);
        });
    });

    req.on('error', (error) => { console.error('Error:', error); });
    req.write(data);
    req.end();
};

// Baca pesan dari stdin atau argumen
let message = '';
if (process.argv.length > 2) {
    message = process.argv.slice(2).join(' ');
    sendMessage(message);
} else {
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
        let chunk;
        while ((chunk = process.stdin.read()) !== null) {
            message += chunk;
        }
    });
    process.stdin.on('end', () => {
        sendMessage(message.trim() || 'Tugas selesai!');
    });
}
