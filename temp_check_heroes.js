const { PrismaClient } = require('./server/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const heroes = await prisma.hero.findMany({
        where: {
            userId: 1
        }
    });
    console.log('HEROES_START');
    console.log(JSON.stringify(heroes));
    console.log('HEROES_END');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
