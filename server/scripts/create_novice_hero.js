const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- Creating Novice Hero for player1 ---");
    
    const noviceClass = await prisma.combatClass.findFirst({
        where: { name: 'Novice' }
    });
    
    if (!noviceClass) {
        console.error("Error: Novice class not found!");
        return;
    }
    
    const newHero = await prisma.hero.create({
        data: {
            name: 'New Recruit',
            userId: 1, // player1
            combatClassId: noviceClass.id,
            level: 1,
            rarity: 'COMMON',
            experience: 0,
            health: 100,
            maxHealth: 100,
            mana: 20,
            maxMana: 20,
            attack: 10,
            defense: 5,
            speed: 10,
            agility: 5,
            intelligence: 5,
            baseAttack: 10,
            baseDefense: 5,
            baseSpeed: 10,
            baseAgility: 5,
            baseIntelligence: 5,
            baseLuck: 5,
            totalStats: JSON.stringify({
                hp: 100,
                mp: 20,
                attack: 10,
                defense: 5,
                speed: 10
            })
        }
    });
    
    console.log(`Successfully created hero: ${newHero.name} (ID: ${newHero.id}) for player1`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
