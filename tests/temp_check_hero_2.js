const { PrismaClient } = require('./server/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const hero2 = await prisma.hero.findUnique({
        where: { id: 2 }
    });
    console.log('HERO_2_START');
    console.log(JSON.stringify(hero2));
    console.log('HERO_2_END');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
