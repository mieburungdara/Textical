const prisma = require('./src/db');

async function verify() {
  console.log('--- Verifying Database Regions ---');
  
  const totalRegions = await prisma.regionTemplate.count();
  console.log(`Log: Total regions in DB: ${totalRegions}`);

  const totalAreas = await prisma.regionArea.count();
  console.log(`Log: Total RegionAreas in DB: ${totalAreas}`);

  const a1 = await prisma.regionTemplate.findFirst({
    where: { name: 'A1' },
    include: { area: true }
  });
  console.log(`Log: Region A1 data (Rich):`, JSON.stringify(a1, null, 2));

  const boss = await prisma.regionTemplate.findFirst({
    where: { zoneType: 'BOSS' },
    include: { 
      area: true,
      hazards: { include: { hazardType: true } }
    }
  });
  console.log(`Log: Boss Zone (R18) RPG Data:`, {
    name: boss.name,
    area: boss.area?.name,
    minUnits: boss.minRequiredUnits,
    minHeroLevel: boss.minRequiredHeroLevel,
    hazards: boss.hazards.map(h => `${h.hazardType.name} (${h.damage} dmg)`),
    flavor: boss.flavorText
  });

  const redZone = await prisma.regionTemplate.findFirst({
    where: { zoneType: 'RED', landmarkName: { not: null } },
    include: { hazards: true }
  });
  if (redZone) {
    console.log(`Log: Discovery & Landmark Check (Red Zone):`, {
      name: redZone.name,
      landmark: redZone.landmarkName,
      discoveryXp: redZone.discoveryXp
    });
  }

  const totalHazards = await prisma.regionHazard.count();
  console.log(`Log: Total RegionHazards active: ${totalHazards}`);

  const waterSample = await prisma.regionTemplate.findFirst({ where: { zoneType: 'WATER' } });
  console.log('Log: Water Zone Tactical:', {
    element: waterSample.elementalAffinity,
    atkMod: waterSample.terrainAttackMod
  });

  const redSample = await prisma.regionTemplate.findFirst({ where: { zoneType: 'RED' } });
  console.log('Log: Red Zone Tactical:', {
    element: redSample.elementalAffinity,
    atkMod: redSample.terrainAttackMod
  });

  const blackSample = await prisma.regionTemplate.findFirst({ where: { zoneType: 'BLACK' } });
  const bossSample = await prisma.regionTemplate.findFirst({ where: { zoneType: 'BOSS' } });
  
  console.log('Log: Corruption Check:', {
    blackCorruption: blackSample.corruptionLevel,
    blackPower: blackSample.sanctuaryPower,
    blackCaste: blackSample.dominanCaste,
    bossCorruption: bossSample.corruptionLevel,
    bossPower: bossSample.sanctuaryPower,
    bossCaste: bossSample.dominanCaste
  });

  const citadelSample = await prisma.regionTemplate.findFirst({ where: { zoneType: 'ROYAL' } });
  console.log('Log: Citadel Power Check:', {
    marketDemand: citadelSample.marketDemandIndex,
    corruption: citadelSample.corruptionLevel,
    power: citadelSample.sanctuaryPower,
    caste: citadelSample.dominanCaste
  });

  if (blackSample.dominanCaste === 'SKELETON' && bossSample.dominanCaste === 'DEMON' && citadelSample.dominanCaste === 'HUMAN') {
    console.log('VERIFICATION SUCCESS: Dominan Caste system verified (Lore Accurate).');
  } else {
    console.log('VERIFICATION FAILED: Data mismatch in caste fields.');
  }

  await prisma.$disconnect();
}

verify();
