const http = require('http');

async function testApi() {
    console.log("🔍 AUDITING ASSET ENDPOINTS...");
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/assets/manifest',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
            console.log('BODY:', body);
            if (res.statusCode === 200) {
                console.log("✅ Route is registered and working.");
            } else {
                console.log("❌ Route is NOT working.");
            }
            process.exit(0);
        });
    });

    req.on('error', (e) => {
        console.error(`❌ Connection failed: ${e.message}`);
        process.exit(1);
    });

    req.end();
}

testApi();