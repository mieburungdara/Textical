const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const skills = await prisma.skillTemplate.findMany({
        where: {
            OR: [
                { name: { contains: 'AP' } },
                { description: { contains: 'AP' } }
            ]
        }
    });

    const traits = await prisma.traitTemplate.findMany({
        where: {
            OR: [
                { name: { contains: 'AP' } },
                { description: { contains: 'AP' } }
            ]
        }
    });

    console.log("--- Skills/Traits containing 'AP' ---");
    console.log(JSON.stringify({ skills, traits }, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
