const prisma = require('./src/db');
async function main() {
    try {
        const classes = await prisma.classTemplate.findMany();
        console.log('Classes found:', classes.map(c => ({ id: c.id, name: c.name })));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
