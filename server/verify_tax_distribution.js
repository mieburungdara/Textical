const prisma = require('./src/db');
const territoryConquestService = require('./src/services/territoryConquestService');

async function verifyTaxDistribution() {
    console.log("--- Verifying Tax Distribution System ---");

    try {
        // 1. Setup Test Data
        let testGuild = await prisma.guild.findUnique({ where: { name: 'Test Knights' } });
        if (!testGuild) {
            const template = await prisma.guildTemplate.findFirst();
            testGuild = await prisma.guild.create({
                data: {
                    name: 'Test Knights',
                    templateId: template.id,
                    treasury: 5000
                }
            });
        }

        // 2. Test Case 1: Guild WITHOUT faction alignment
        console.log("\n=== TEST CASE 1: No Faction Alignment ===");
        const neutralRegion = await prisma.regionTemplate.findFirst({
            where: { zoneType: 'GREEN', factionId: null }
        });

        if (neutralRegion) {
            await prisma.$transaction(async (tx) => {
                await territoryConquestService.captureTerritory(tx, testGuild.id, neutralRegion.id);
            });

            const territory1 = await prisma.territory.findUnique({
                where: { regionId: neutralRegion.id }
            });

            if (territory1.taxDistributionRate === 0.5) {
                console.log(`✅ SUCCESS: Base rate 50% (Guild) / 50% (Royal) for non-aligned.`);
            } else {
                console.error(`❌ FAILED: Expected 0.5, got ${territory1.taxDistributionRate}`);
            }

            // Cleanup
            await prisma.$transaction(async (tx) => {
                await territoryConquestService.relinquishTerritory(tx, neutralRegion.id);
            });
        }

        // 3. Test Case 2: Guild WITH faction alignment
        console.log("\n=== TEST CASE 2: With Faction Alignment ===");
        const faction = await prisma.faction.findFirst();
        if (faction) {
            // Update guild to have faction
            await prisma.guild.update({
                where: { id: testGuild.id },
                data: { factionId: faction.id }
            });

            const factionRegion = await prisma.regionTemplate.findFirst({
                where: { factionId: faction.id }
            });

            if (factionRegion) {
                await prisma.$transaction(async (tx) => {
                    await territoryConquestService.captureTerritory(tx, testGuild.id, factionRegion.id);
                });

                const territory2 = await prisma.territory.findUnique({
                    where: { regionId: factionRegion.id }
                });

                if (territory2.taxDistributionRate === 0.7) {
                    console.log(`✅ SUCCESS: Faction bonus 70% (Guild) / 30% (Royal) for aligned.`);
                } else {
                    console.error(`❌ FAILED: Expected 0.7, got ${territory2.taxDistributionRate}`);
                }

                // Cleanup
                await prisma.$transaction(async (tx) => {
                    await territoryConquestService.relinquishTerritory(tx, factionRegion.id);
                });
            }

            // Reset guild faction
            await prisma.guild.update({
                where: { id: testGuild.id },
                data: { factionId: null }
            });
        }

    } catch (error) {
        console.error("ERROR DURING VERIFICATION:", error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyTaxDistribution();
