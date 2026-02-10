const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- Fetching Equipment Templates ---");
    const templates = await prisma.itemTemplate.findMany({
        where: {
            category: {
                in: ['WEAPON', 'ARMOR', 'HELMET', 'ACCESSORY']
            }
        },
        take: 10
    });
    console.log(JSON.stringify(templates, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
