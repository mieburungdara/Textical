const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userId = 1;
    console.log(`--- Fetching heroes for User ID ${userId} ---`);
    const heroes = await prisma.hero.findMany({
        where: { userId: userId }
    });
    console.log(JSON.stringify(heroes, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
