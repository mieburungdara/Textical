const axios = require('axios');
const prisma = require('./src/db');

async function test() {
    console.log('=== Testing Database Connection ===');
    const heroCount = await prisma.hero.count();
    console.log('Database hero count:', heroCount);
    
    if (heroCount > 0) {
        console.log('\n=== Database Heroes ===');
        const heroes = await prisma.hero.findMany({
            include: {
                user: { select: { id: true, username: true } },
                combatClass: { select: { id: true, name: true } }
            }
        });
        console.log(JSON.stringify(heroes, null, 2));
    }
    
    console.log('\n=== Testing API Endpoint ===');
    try {
        const response = await axios.get('http://localhost:5000/api/admin/heroes', {
            headers: {
                'x-admin-token': 'textical-admin-2024'
            }
        });
        
        console.log('API Response status:', response.status);
        
        const data = response.data;
        console.log('API Response:', JSON.stringify(data, null, 2));
        
        if (data.data) {
            console.log('API heroes count:', data.data.heroes.length);
        }
        
    } catch (error) {
        console.error('API Error:', error.response?.data || error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
