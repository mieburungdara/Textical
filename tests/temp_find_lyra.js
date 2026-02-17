const { PrismaClient } = require('./server/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const lyras = await prisma.hero.findMany({
        where: {
            name: { contains: 'Lyra' }
        }
    });
    console.log('LYRAS_START');
    console.log(JSON.stringify(lyras));
    console.log('LYRAS_END');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
