const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- AUTHORITATIVE LORE & REGION UPDATE ---");

  const regions = [
    {
      id: 1, name: "Oakhaven Hub", description: "The Town", type: "TOWN",
      metadata: {
        lore: "Oakhaven was founded 200 years ago by the legendary logger, Silas Elm.",
        tips: ["Tavern recovery is 10x faster than outside.", "Check the Quest Board daily for gold."],
        history: "A peaceful sanctuary untouched by the Dark Grove's corruption."
      }
    },
    {
      id: 2, name: "Iron Mine", description: "Ore Mine", type: "WILDERNESS", dangerLevel: 2,
      metadata: {
        lore: "Deep beneath the earth lies the vein of Titan's Blood, also known as Iron.",
        tips: ["Gimli gets a gathering bonus in mines.", "Watch out for Cave Spiders in the deep."],
        history: "Abandoned during the Great Gem War, now reclaimed by scavengers."
      }
    },
    {
      id: 3, name: "Crystal Depths", description: "Gems", type: "WILDERNESS", dangerLevel: 5,
      metadata: {
        lore: "Where light itself crystallizes into Mana.",
        tips: ["Mana Crystals are heavy but valuable.", "Light-trait heroes excel here."],
        history: "The birthplace of the first Wizards."
      }
    },
    {
      id: 4, name: "Elm Forest", description: "Lumber", type: "WILDERNESS", dangerLevel: 3,
      metadata: {
        lore: "A dense canopy where the trees whisper ancient secrets.",
        tips: ["Fire-trait skills are dangerous but effective here.", "Elm wood is perfect for bows."],
        history: "Formerly the hunting grounds of the Solar Vanguard."
      }
    },
    {
      id: 5, name: "Forbidden Grove", description: "Dark", type: "WILDERNESS", dangerLevel: 8,
      metadata: {
        lore: "A place where reality itself starts to fray at the edges.",
        tips: ["Never travel here without a full team.", "The darkness drains vitality faster."],
        history: "The epicentre of the corruption that ended the Age of Kings."
      }
    }
  ];

  console.log("[1/2] Updating Region Lore...");
  for (const r of regions) {
    const metaStr = JSON.stringify(r.metadata);
    await prisma.regionTemplate.upsert({
      where: { id: r.id },
      update: { metadata: metaStr, name: r.name, type: r.type },
      create: { 
        id: r.id, 
        name: r.name, 
        description: r.description, 
        type: r.type, 
        metadata: metaStr 
      }
    });
  }

  console.log("[2/2] Finalizing State...");
  await prisma.user.updateMany({
    where: { username: "player1" },
    data: { gold: 1000 }
  });

  console.log("--- LORE SYNC COMPLETE ---");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
