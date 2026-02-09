const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const monster = await prisma.monsterTemplate.findUnique({
    where: { id: 6004 },
    include: {
      category: true,
      traits: {
        include: { trait: true }
      }
    }
  });

  if (!monster) {
    console.log("Monster 6004 not found in database.");
  } else {
    console.log(JSON.stringify(monster, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
