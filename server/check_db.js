const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const region = await prisma.regionTemplate.findUnique({
        where: { id: 180 }
    });
    console.log('Region 180:', region ? region.name : 'NOT FOUND');
    
    const users = await prisma.user.findMany({
        take: 5,
        select: { username: true, currentRegion: true }
    });
    console.log('Sample Users:', users);
    
    await prisma.$disconnect();
}

check();
