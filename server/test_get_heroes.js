const prisma = require('./src/db');
const AdminController = require('./src/controllers/AdminController');

async function test() {
    console.log('Testing AdminController.getHeroes...');
    
    try {
        // Mock request and response
        const req = {
            query: {
                page: 1,
                limit: 50,
                search: '',
                userId: null
            }
        };
        
        const res = {
            json: function(data) {
                console.log('API Response:', JSON.stringify(data, null, 2));
            },
            status: function(code) {
                console.log('Status:', code);
                return this;
            },
            send: function(data) {
                console.log('Send:', data);
            }
        };
        
        // Call the method
        await AdminController.getHeroes(req, res);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test().catch(console.error);
