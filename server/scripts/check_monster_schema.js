const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- Fetching one monster sample ---");
    const monster = await prisma.monsterTemplate.findFirst();
    console.log(JSON.stringify(monster, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
