const https = require('https');
const fs = require('fs');


const BOT_TOKEN = '8525420361:AAHdjSDZ8YI7ld_OjZ4b35vAltSBlrrDEDs';
const CHAT_ID = '6651379178';

if (!BOT_TOKEN || !CHAT_ID) {
    console.error('BOT_TOKEN atau CHAT_ID belum diset di environment variable.');
    process.exit(1);
}

const TELEGRAM_LIMIT = 4096;

// ================= TELEGRAM REQUEST =================
function sendMessage(text) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
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
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';

            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);

                    console.log('Status:', res.statusCode);
                    console.log('OK:', json.ok);

                    if (!json.ok) {
                        console.error('Telegram Error:', json.description);
                        return reject(json.description);
                    }

                    resolve(json);
                } catch (err) {
                    reject(err);
                }
            });
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

// ================= AUTO SPLIT =================
async function sendLongMessage(text) {
    if (text.length <= TELEGRAM_LIMIT) {
        return sendMessage(text);
    }

    const chunks = text.match(new RegExp(`.{1,${TELEGRAM_LIMIT}}`, 'gs'));

    for (const chunk of chunks) {
        await sendMessage(chunk);
    }
}

// ================= READ STDIN (PIPE SUPPORT) =================
async function readStdin() {
    let data = '';
    process.stdin.setEncoding('utf8');

    for await (const chunk of process.stdin) {
        data += chunk;
    }

    return data.trim();
}

// ================= MAIN =================
(async () => {
    try {
        let argInput = process.argv.slice(2).join(' ').trim();

        // 1️⃣ Jika argument adalah file
        if (argInput && fs.existsSync(argInput) && fs.lstatSync(argInput).isFile()) {
            const fileContent = fs.readFileSync(argInput, 'utf8');
            return sendLongMessage(fileContent);
        }

        // 2️⃣ Jika argument text langsung
        if (argInput) {
            return sendLongMessage(argInput);
        }

        // 3️⃣ Jika ada PIPE (stdin)
        const stdinData = await readStdin();
        if (stdinData.length > 0) {
            return sendLongMessage(stdinData);
        }

        // 4️⃣ Default fallback
        await sendLongMessage('Tugas selesai!');
    } catch (err) {
        console.error('Fatal Error:', err);
        process.exit(1);
    }
})();
