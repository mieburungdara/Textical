const prisma = require('./src/db');

async function check() {
    const cats = await prisma.monsterCategory.findMany();
    console.log("Categories:", JSON.stringify(cats, null, 2));
    
    const monsters = await prisma.monsterTemplate.findMany({ include: { category: true } });
    console.log("Monsters:", JSON.stringify(monsters.map(m => ({ id: m.id, name: m.name, cat: m.category.name, catId: m.categoryId })), null, 2));
}

check().catch(e => console.error(e)).finally(() => process.exit(0));
