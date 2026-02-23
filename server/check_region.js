const prisma = require('./src/db');

async function main() {
  // Check for Oakhaven
  const oakhaven = await prisma.regionTemplate.findFirst({
    where: { name: { contains: 'Oakhaven' } },
    select: { id: true, name: true, zoneType: true, gridX: true, gridY: true }
  });
  console.log("=== OAKHAVEN ===");
  console.log(JSON.stringify(oakhaven, null, 2));
  
  // Check region 1
  const r1 = await prisma.regionTemplate.findUnique({
    where: { id: 1 },
    select: { id: true, name: true, zoneType: true, gridX: true, gridY: true }
  });
  console.log("\n=== REGION 1 ===");
  console.log(JSON.stringify(r1, null, 2));
  
  // Check users
  const users = await prisma.user.findMany({
    select: { id: true, username: true, currentRegion: true }
  });
  console.log("\n=== USERS ===");
  console.log(JSON.stringify(users, null, 2));
  
  await prisma.$disconnect();
}

main().catch(console.error);
