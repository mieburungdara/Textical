const https = require('https');


const BOT_TOKEN = '8525420361:AAHdjSDZ8YI7ld_OjZ4b35vAltSBlrrDEDs';
const CHAT_ID = '6651379178';

function escapeMarkdownV2(text) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

const sendMessage = (rawMessage) => {
  const text = escapeMarkdownV2(rawMessage.replace(/\\n/g, '\n'));

  const data = JSON.stringify({
    chat_id: CHAT_ID,
    text,
    parse_mode: 'MarkdownV2'
  });

  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', body);
    });
  });

  req.on('error', console.error);
  req.write(data);
  req.end();
};

const message = process.argv.slice(2).join('\n');

sendMessage(message || 'Tugas selesai');
