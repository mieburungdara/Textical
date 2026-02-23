const WebSocket = require('ws');
const axios = require('axios');

async function test() {
    try {
        console.log("Logging in...");
        const res = await axios.post('http://127.0.0.1:5000/api/auth/login', {
            username: 'player1',
            password: 'password123',
            deviceInfo: 'TestScript (Node)'
        });
        
        const token = res.data.data.session.token;
        const userId = res.data.data.user.id;
        console.log(`Login success. Token: ${token}, UserId: ${userId}`);
        
        // Connect to Socket.IO exactly like Godot
        const url = 'ws://127.0.0.1:5000/socket.io/?EIO=4&transport=websocket';
        console.log(`Connecting to: ${url}`);
        const ws = new WebSocket(url);
        
        ws.on('open', () => {
            console.log('WS Open. Waiting for EIO handshake...');
        });
        
        ws.on('message', (data) => {
            const msg = data.toString();
            console.log('< ' + msg);
            
            if (msg.startsWith('0')) {
                // EIO Open 0{"sid":"...","pingInterval":25000,"pingTimeout":5000}
                console.log('Got EIO Open. Sending SIO Connect (40)...');
                const authData = { token, userId };
                const payload = "40" + JSON.stringify(authData);
                console.log('> ' + payload);
                ws.send(payload);
            } else if (msg.startsWith('40')) {
                console.log('Got SIO Connect OK! (Session Authenticated)');
                setTimeout(() => ws.close(), 1000);
            } else if (msg.startsWith('44')) {
                console.log('Got SIO Connect Error!');
                setTimeout(() => ws.close(), 1000);
            }
        });
        
        ws.on('close', (code, reason) => {
            console.log(`WS Closed: ${code} ${reason.toString()}`);
        });
        
        ws.on('error', (err) => {
            console.error('WS Error:', err);
        });

    } catch (e) {
        console.error("Test failed:", e.response ? e.response.data : e.message);
    }
}
test();
