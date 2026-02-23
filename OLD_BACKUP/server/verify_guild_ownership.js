const prisma = require('./src/db');
const territoryConquestService = require('./src/services/territoryConquestService');

async function verifyGuildOwnership() {
    console.log("--- Verifying Guild Ownership System ---");

    try {
        // 1. Persiapkan Data Uji
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

        const testRegion = await prisma.regionTemplate.findFirst({
            where: { zoneType: 'GREEN' }
        });

        console.log(`Testing with Guild: ${testGuild.name} and Region: ${testRegion.name}`);

        // 2. Simulasi Capture Territory
        await prisma.$transaction(async (tx) => {
            await territoryConquestService.captureTerritory(tx, testGuild.id, testRegion.id);
        });

        // 3. Verifikasi Denormalisasi di RegionTemplate
        const updatedRegion = await prisma.regionTemplate.findUnique({
            where: { id: testRegion.id }
        });

        if (updatedRegion.guildOwnershipId === testGuild.id) {
            console.log("✅ SUCCESS: RegionTemplate.guildOwnershipId synchronized.");
        } else {
            console.error("❌ FAILED: RegionTemplate.guildOwnershipId NOT synchronized.");
        }

        // 4. Verifikasi Inisialisasi Maintenance di Territory
        const territory = await prisma.territory.findUnique({
            where: { regionId: testRegion.id }
        });

        if (territory && territory.maintenanceCost === 1000 && territory.monthlyQuestQuota === 5) {
            console.log("✅ SUCCESS: Territory maintenance fields initialized.");
        } else {
            console.error("❌ FAILED: Territory maintenance fields NOT initialized correctly.");
        }

        // 5. Cleanup (Optional: Relinquish)
        await prisma.$transaction(async (tx) => {
            await territoryConquestService.relinquishTerritory(tx, testRegion.id);
        });

        const releasedRegion = await prisma.regionTemplate.findUnique({
            where: { id: testRegion.id }
        });

        if (releasedRegion.guildOwnershipId === null) {
            console.log("✅ SUCCESS: RegionTemplate.guildOwnershipId cleared after relinquishment.");
        } else {
            console.error("❌ FAILED: RegionTemplate.guildOwnershipId NOT cleared.");
        }

    } catch (error) {
        console.error("ERROR DURING VERIFICATION:", error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyGuildOwnership();
