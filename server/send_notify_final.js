const https = require('https');

// Use environment variables for security
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

const message = `✦ 🏆 <b>Database Consistency Audit: FULLY OPERATIONAL</b>

💬 <b>Permintaan/Pertanyaan:</b>
Tinjau dan perbaiki konsistensi penggunaan database di repository Textical.

🛠️ <b>Jawaban/Implementasi:</b>
Berhasil mengaudit 12 file dan refactor 5 file PrismaClient duplikat.

📜 <b>World Lore:</b>
Para arsitek database Eldoria kini menerapkan standar tunggal.

🌟 <b>Milestones Reached:</b>
- Audit 12 file di server/src/logic/
- Refactor 5 file services dan handlers
- Verifikasi test passed

📊 <b>Technical Details:</b>
- Files: 0 New, 5 Modified
- Audit: PASS

🚀 <b>Next Up:</b>
Unit Stat System Integration`;

const data = JSON.stringify({
    chat_id: CHAT_ID,
    text: message,
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
