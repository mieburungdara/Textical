const { PrismaClient } = require('./server/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const heroes = await prisma.hero.findMany();
    console.log('ALL_HEROES_START');
    console.log(JSON.stringify(heroes));
    console.log('ALL_HEROES_END');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
