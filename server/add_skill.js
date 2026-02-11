const prisma = require('./src/db');

async function main() {
    try {
        const user = await prisma.user.findFirst({
            include: { heroes: true }
        });

        if (!user || user.heroes.length === 0) {
            console.log("No user or hero found.");
            return;
        }

        const hero = user.heroes[0];
        console.log(`Target Hero: ${hero.name} (ID: ${hero.id})`);

        // 1. Create/Find Skill Template
        // ID 9001 for "Ancient Fire Breath"
        const skillId = 9001; 
        let skill = await prisma.skillTemplate.findUnique({
            where: { id: skillId }
        });

        if (!skill) {
            console.log("Creating SkillTemplate...");
            skill = await prisma.skillTemplate.create({
                data: {
                    id: skillId,
                    name: "Ancient Fire Breath",
                    description: "Exhale a massive cone of primordial fire. Scorches everything in its path.",
                    category: "ACTIVE", // Schema expects String
                    type: "DAMAGE",
                    manaCost: 50,
                    // Note: element and cooldown are not in schema, so we skip them for DB.
                    // The client might need updates to handle missing fields gracefully or get them from JSONs.
                }
            });
        }

        // 2. Link to Hero
        const existingLink = await prisma.heroSkill.findUnique({
            where: {
                heroId_skillId: {
                    heroId: hero.id,
                    skillId: skillId
                }
            }
        });

        if (!existingLink) {
            await prisma.heroSkill.create({
                data: {
                    heroId: hero.id,
                    skillId: skillId,
                    isActive: true
                }
            });
            console.log(`Skill '${skill.name}' added to hero '${hero.name}'!`);
        } else {
            console.log(`Hero already has skill '${skill.name}'.`);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
