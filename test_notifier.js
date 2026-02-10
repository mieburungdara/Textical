const notifier = require('node-notifier');
const path = require('path');

console.log('Sending notification...');

notifier.notify(
  {
    title: 'Textical System',
    message: 'Proses selesai',
    sound: true, // Berbunyi pada Windows 10+ / macOS
    wait: false,
    timeout: 5
  },
  function (err, response, metadata) {
    if (err) {
      console.error('Error:', err);
    }
    console.log('Notification sent!');
    process.exit(0);
  }
);
