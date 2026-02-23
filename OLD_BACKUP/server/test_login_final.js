const authService = require('./src/services/AuthenticationService');

async function test() {
    console.log('Testing login for player1...');
    try {
        const user = await authService.validateCredentials('player1', 'password123', '127.0.0.1', 'NodeTest');
        console.log('✅ Login SUCCESS for:', user.username);
    } catch (e) {
        console.error('❌ Login FAILED:', e.message);
    }
    process.exit();
}

test();
