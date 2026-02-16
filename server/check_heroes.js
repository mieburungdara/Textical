const prisma = require('./src/db');

async function check() {
    const users = await prisma.user.findMany({
        include: { heroes: true }
    });
    console.log(JSON.stringify(users.map(u => ({
        id: u.id,
        username: u.username,
        heroCount: u.heroes.length,
        heroes: u.heroes.map(h => h.name)
    })), null, 2));
    await prisma.$disconnect();
}

check();
