const https = require('https');

const BOT_TOKEN = '8525420361:AAHdjSDZ8YI7ld_OjZ4b35vAltSBlrrDEDs';
const CHAT_ID = '6651379178';

const sendMessage = (message) => {
    // 1. Handle newlines from shell
    const text = message.replace(/\\n/g, '\n');

    const data = JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'HTML'
    });

    const options = {
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
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

const message = process.argv.slice(2).join(' ');
sendMessage(message || 'Tugas selesai!');
