const prisma = require('../src/db');

async function main() {
  console.log('--- Cleaning Up All Data (Atomic Wipe) ---');
  
  try {
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');
    
    const tables = [
      'RegionHazard', 'RegionMonster', 'RegionNPC', 'RegionResource', 
      'ActiveEvent', 'MarketOrder', 'HeroOrder', 'TaskQueue', 
      'TavernMercenary', 'NPCTeleportRoute', 'NPCSchedule', 
      'NPCEventReaction', 'RegionalInfluence', 'HeroSaleHistory', 
      'ItemSaleHistory', 'ShopStock', 'RegionalExtractionStats', 
      'Bounty', 'WorldBossState', 'RegionConnection', 'User', 'Hero',
      'RegionTemplate', 'RegionArea'
    ];

    for (const table of tables) {
      try {
        await prisma[table].deleteMany({});
        console.log(`Cleared table: ${table}`);
      } catch (e) {
        // Some tables might not exist or have issues, just continue
      }
    }

    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');
    console.log('--- Cleanup Finished ---');
  } catch (err) {
    console.error('Fatal Cleanup Error:', err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
