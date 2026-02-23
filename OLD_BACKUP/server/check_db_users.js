const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log('--- Database User Check ---');
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true }
        });
        console.log('Registered Users:', users);
        
        const player1 = await prisma.user.findUnique({
            where: { username: 'player1' }
        });
        
        if (player1) {
            console.log('✅ player1 exists (ID: ' + player1.id + ')');
        } else {
            console.log('❌ player1 NOT FOUND in database');
        }
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
