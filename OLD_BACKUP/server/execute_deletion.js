const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const adapter = new PrismaBetterSqlite3({
  url: 'file:' + path.join(__dirname, 'prisma/dev.db')
});
const prisma = new PrismaClient({ adapter });

async function del() {
    const ids = [998, 999];
    const defaultRegionId = 1; // A1
    console.log('Starting V4 FINAL cascading deletion of regions:', ids);
    try {
        // 1. Relocate Users
        await prisma.user.updateMany({
            where: { currentRegion: { in: ids } },
            data: { currentRegion: defaultRegionId }
        });
        await prisma.user.updateMany({
            where: { bindPointId: { in: ids } },
            data: { bindPointId: defaultRegionId }
        });

        // 2. Clear Tasks & Events
        await prisma.taskQueue.deleteMany({
            where: { OR: [{ targetRegionId: { in: ids } }, { originRegionId: { in: ids } }] }
        });
        await prisma.activeEvent.deleteMany({ where: { regionId: { in: ids } } });

        // 3. Delete Regional Data (Cascading)
        const tables = [
            'regionHazard', 'regionResource', 'regionMonster', 'regionNPC',
            'regionalInfluence', 'tavernMercenary', 'regionalDailyTask',
            'regionalExtractionStats', 'regionalVault', 'regionalContract',
            'spiritNode', 'regionEffect', 'regionSpirit', 'worldBossState',
            'hiddenTreasure'
        ];

        for (const table of tables) {
            try {
                if (prisma[table]) {
                    const res = await prisma[table].deleteMany({ where: { regionId: { in: ids } } });
                    if (res.count > 0) console.log(`Deleted ${res.count} records from ${table}`);
                }
            } catch (e) {}
        }

        // 4. Region Connections
        await prisma.regionConnection.deleteMany({
            where: { OR: [{ originRegionId: { in: ids } }, { targetRegionId: { in: ids } }] }
        });

        // 5. Finally delete the regions
        const res = await prisma.regionTemplate.deleteMany({
            where: { id: { in: ids } }
        });
        console.log('Successfully deleted regions. Count:', res.count);
    } catch (e) {
        console.error('Delete process failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

del();
