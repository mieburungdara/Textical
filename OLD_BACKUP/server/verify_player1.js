const prisma = require('./src/db');

async function verify() {
    const userCount = await prisma.user.count();
    console.log('Total Users:', userCount);
    
    const users = await prisma.user.findMany({
        select: { username: true }
    });
    console.log('Usernames:', users.map(u => u.username).join(', '));
    
    const player1 = await prisma.user.findUnique({
        where: { username: 'player1' }
    });
    
    if (player1) {
        console.log('Player1 exists!');
    } else {
        console.log('Player1 DOES NOT exist.');
    }
    
    await prisma.$disconnect();
}

verify();
