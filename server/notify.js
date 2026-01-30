const https = require('https');

const BOT_TOKEN = '8525420361:AAHdjSDZ8YI7ld_OjZ4b35vAltSBlrrDEDs';
const CHAT_ID = '6651379178';

const sendMessage = (message) => {
    const data = JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
    });

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
            responseData += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log('Notification sent successfully to Telegram.');
            } else {
                console.error('Failed to send notification:', responseData);
            }
        });
    });

    req.on('error', (error) => {
        console.error('Error sending notification:', error);
    });

    req.write(data);
    req.end();
};

const message = process.argv.slice(2).join(' ') || 'Tugas telah selesai dikerjakan!';
sendMessage(message);
