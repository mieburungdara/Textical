const prisma = require('./src/db');

async function checkItems() {
    const items = await prisma.itemTemplate.findMany();
    console.log("Existing Items:", items.map(i => `${i.id}: ${i.name} (${i.type})`));
}

checkItems()
    .catch(e => console.error(e))
    .finally(async () => {
        // await prisma.$disconnect(); 
    });
