const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- Fetching Item Templates ---");
    const templates = await prisma.itemTemplate.findMany({
        take: 20
    });
    console.log(JSON.stringify(templates, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
