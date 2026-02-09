const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- Checking User and Hero Ownership ---");
    const users = await prisma.user.findMany({
        include: {
            heroes: {
                include: {
                    combatClass: true
                }
            }
        }
    });
    
    users.forEach(u => {
        console.log(`User: ${u.username} (ID: ${u.id})`);
        if (u.heroes.length === 0) {
            console.log("  - No heroes owned.");
        } else {
            u.heroes.forEach(h => {
                console.log(`  - Hero: ${h.name} (Class: ${h.combatClass ? h.combatClass.name : 'None'})`);
            });
        }
        console.log("");
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
