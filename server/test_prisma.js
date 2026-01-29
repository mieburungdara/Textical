const prisma = require('./src/db');

async function test() {
    try {
        const res = await prisma.monsterLootEntry.findMany({
            include: { item: true }
        });
        console.log("Success:", res.length);
    } catch (e) {
        console.error("Error:", e.message);
    }
    process.exit(0);
}
test();
