const https = require('https');
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = '8525420361:AAHdjSDZ8YI7ld_OjZ4b35vAltSBlrrDEDs';
const CHAT_ID = '6651379178';

const sendMessage = (message) => {
    // 1. Handle newlines from shell or file
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
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(data, 'utf8')
        }
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            const parsedRes = JSON.parse(responseData);
            console.log('OK:', parsedRes.ok);
            if (!parsedRes.ok) console.error('Error Details:', parsedRes.description);
            process.exit(res.statusCode === 200 ? 0 : 1);
        });
    });

    req.on('error', (error) => { 
        console.error('Error:', error);
        process.exit(1);
    });
    
    req.write(data, 'utf8');
    req.end();
};

// Main logic
let input = process.argv.slice(2).join(' ');

// Check if input is a file path
if (input && fs.existsSync(input) && fs.lstatSync(input).isFile()) {
    input = fs.readFileSync(input, 'utf8');
}

sendMessage(input || 'Tugas selesai!');
