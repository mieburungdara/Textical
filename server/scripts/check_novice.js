const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- Checking Database for Novice Units ---");
    const heroes = await prisma.hero.findMany({
        include: {
            combatClass: true
        }
    });
    
    if (heroes.length === 0) {
        console.log("No heroes found in database.");
    } else {
        console.log(`Found ${heroes.length} heroes:`);
        heroes.forEach(h => {
            console.log(`- ${h.name} (ID: ${h.id}, Class: ${h.combatClass ? h.combatClass.name : 'None'})`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
