const { PrismaClient } = require('./server/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const classes = await prisma.classTemplate.findMany();
    console.log('CLASSES_START');
    console.log(JSON.stringify(classes));
    console.log('CLASSES_END');
    
    const lyra = await prisma.hero.findFirst({
        where: {
            name: { contains: 'Lyra' },
            userId: 1
        }
    });
    console.log('LYRA_START');
    console.log(JSON.stringify(lyra));
    console.log('LYRA_END');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());