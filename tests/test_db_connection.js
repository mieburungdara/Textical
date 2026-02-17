const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log('=== Testing Prisma Connection ===');
    console.log('Date:', new Date().toISOString());
    
    try {
        // Test connection by counting records in different tables
        const [userCount, heroCount, monsterCount] = await Promise.all([
            prisma.user.count(),
            prisma.hero.count(),
            prisma.monsterTemplate.count()
        ]);
        
        console.log(`\n=== Database Statistics ===`);
        console.log(`Users: ${userCount}`);
        console.log(`Heroes: ${heroCount}`);
        console.log(`Monsters: ${monsterCount}`);
        
        // If there are users, show first 3
        if (userCount > 0) {
            console.log(`\n=== First 3 Users ===`);
            const users = await prisma.user.findMany({ 
                take: 3,
                select: { id: true, username: true, createdAt: true, isAdmin: true }
            });
            users.forEach(u => {
                console.log(`- ID: ${u.id}, Username: ${u.username}, Admin: ${u.isAdmin}`);
            });
        }
        
        // Try to create a hero without user
        console.log(`\n=== Creating Test Hero ===`);
        const newHero = await prisma.hero.create({
            data: {
                name: 'Test Hero ' + Date.now(),
                unitLevel: 1,
                unitXp: 0,
                userId: null
            },
            select: { id: true, name: true, unitLevel: true, userId: true, createdAt: true }
        });
        console.log(`Created hero:`, newHero);
        
        // Verify creation
        const updatedCount = await prisma.hero.count();
        console.log(`\nHero count after creation:`, updatedCount);
        
        // Show hero details
        const createdHero = await prisma.hero.findUnique({ 
            where: { id: newHero.id },
            include: { user: { select: { id: true, username: true } } }
        });
        console.log(`\nHero details:`, JSON.stringify(createdHero, null, 2));
        
    } catch (error) {
        console.error(`\n=== ERROR ===`);
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

test().catch(console.error);
