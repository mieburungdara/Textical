const PropertyService = require('./src/services/PropertyService');
const PropertyAccessService = require('./src/services/PropertyAccessService');
const RegionalEconomicService = require('./src/services/RegionalEconomicService');
const prisma = require('./src/db');

async function testPropertySystem() {
    console.log("--- Starting Property System Verification ---");

    try {
        // 1. Setup Dummy Data
        const testUser = await prisma.user.upsert({
            where: { username: 'PropTester' },
            update: { silver: 100000 },
            create: { username: 'PropTester', silver: 100000, password: 'password123' }
        });

        const guestUser = await prisma.user.upsert({
            where: { username: 'GuestTester' },
            update: {},
            create: { username: 'GuestTester', password: 'password123' }
        });

        // Find a Citadel or Village region
        const regions = await prisma.regionTemplate.findMany({
            where: { zoneType: { in: ['ROYAL', 'VILLAGE'] } },
            take: 1
        });

        if (regions.length === 0) throw new Error("No suitable regions found. Run mapSeeder first.");
        const region = regions[0];

        console.log(`Testing in Region: ${region.id} (${region.zoneType})`);

        // 2. Test Purchase
        console.log("Testing plot purchase...");
        const property = await PropertyService.purchasePlot(testUser.id, region.id);
        console.log("✅ Purchase successful:", property.propertyName);

        // 3. Test Upgrade
        console.log("Testing property upgrade...");
        const upgraded = await PropertyService.upgradeTier(testUser.id, property.id);
        console.log("✅ Upgrade successful! New Tier:", upgraded.tier);

        // 4. Test Rename
        console.log("Testing rename...");
        await PropertyService.renameProperty(testUser.id, property.id, "The Iron Tower");
        console.log("✅ Rename successful!");

        // 5. Test Access Control
        console.log("Testing guest access...");
        await PropertyAccessService.addGuest(testUser.id, property.id, guestUser.id, "WORKBENCH");
        const hasAccess = await PropertyAccessService.hasAccess(guestUser.id, property.id, "WORKBENCH");
        console.log("✅ Guest access verified:", hasAccess);

        // 6. Test Economic Bonus
        console.log("Testing regional status update...");
        const isHub = await RegionalEconomicService.updateRegionalStatus(region.id);
        console.log("Region is Economic Hub?", isHub);

        // 7. Cleanup & Finish
        console.log("--- Verification Completed Successfully ---");

    } catch (error) {
        console.error("❌ Verification Failed:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testPropertySystem();
