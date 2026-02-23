// Quick script to check achievement count and seed if needed
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const count = await prisma.achievement.count();
        console.log('Current achievement count:', count);
        
        if (count === 0) {
            console.log('Seeding achievements...');
            const achievementService = require('./src/services/AchievementService');
            await achievementService.seedAchievements();
            console.log('Seeding completed!');
            
            const newCount = await prisma.achievement.count();
            console.log('New achievement count:', newCount);
        } else {
            console.log('Achievements already seeded');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
