const prisma = require('./src/db');

async function main() {
    try {
        const userId = 1;
        const heroes = await prisma.hero.findMany({
            where: { userId },
            include: { 
                combatClass: true, 
                equipment: true,
                skills: {
                    where: { isActive: true },
                    include: { skill: true }
                }
            }
        });

        const flattenedHeroes = heroes.map(hero => {
            const flatSkills = hero.skills.map(hs => hs.skill);
            return {
                id: hero.id,
                name: hero.name,
                skills: flatSkills
            };
        });

        console.log(JSON.stringify(flattenedHeroes, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
