const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL FINAL CODEX (v17.0 - FULL LORE) ---");

  const classes = [
    // --- TIER 0 ---
    { id: 1001, name: "Novice", description: "Every legend begins with a single step into the unknown. The Novice is a traveler of unformed destiny, possessing a raw potential that has yet to be carved by the harsh realities of the battlefield. They carry basic tools and an open mind, eager to learn from the masters of the world." },

    // --- TIER 1 ---
    { id: 1101, name: "Warrior", description: "The backbone of any civilized army, the Warrior is a student of steel and stamina. Clad in toughened hide and iron, they stand at the frontlines, absorbing the impact of the enemy's first wave. They believe that a battle is won not by the swiftness of the blade, but by the resilience of the heart." },
    { id: 1102, name: "Scout", description: "Moving like a whisper through the undergrowth, the Scout is the ultimate explorer. They are trained to see what others miss and to tread where others fear to step. A Scout relies on their superior mobility and keen senses to navigate the 50x50 grid, identifying enemy positions and striking from the shadows." },
    { id: 1103, name: "Apprentice", description: "The path of magic is long and fraught with peril, and the Apprentice has only just begun to scratch the surface of the universe's secrets. They spend their days studying ancient scrolls and practicing the precise movements required to channel raw mana into cohesive spells." },
    { id: 1104, name: "Votary", description: "The Votary does not seek to conquer the world, but to conquer themselves. Through meditation and rigorous physical conditioning, they have developed a body that can endure the most hostile environments. A Votary believes that true power comes from resilience." },
    { id: 1105, name: "Brute", description: "In the wild places of the world, strength is the only law. The Brute is a primal force of nature, eschewing the refined techniques of the city-born for raw, unbridled power. They do not fight for honor or duty, but for the thrill of the hunt." },
    { id: 1106, name: "Duelist", description: "The Duelist treats every pertempuran as a high-stakes game of chess. They are masters of the blade who prioritize technique and precision over raw power. A Duelist spends years perfecting their footwork and timing." },
    { id: 1107, name: "Archer", description: "The Archer is the master of death from a distance. Trained from childhood to read the wind and the arc of a shot, they can pinpoint a target from across the battlefield with uncanny accuracy." },

    // --- TIER 2 ---
    { id: 2101, name: "Knight", description: "A symbol of unwavering duty and martial excellence. The Knight is more than a soldier; they are a guardian of the innocent and a pillar of the community. Clad in heavy plate armor and master of the shield, a Knight commands the battlefield through presence alone." },
    { id: 2103, name: "Rogue", description: "Operating where the law ends and the shadows begin, the Rogue is a master of infiltration and sudden, lethal violence. They don't fight fair; they fight to win. Using advanced stealth techniques, a Rogue can deliver crippling strikes before the enemy even knows they are there." },
    { id: 2111, name: "Wizard", description: "Masters of the mass-destruction arcane arts. Wizards have moved beyond simple bolts of energy to shaping the fabric of reality into massive areas of effect. They are the architects of the battlefield, capable of turning an entire enemy formation to ash with a single word." },

    // --- TIER 3 ---
    { id: 3101, name: "Lord Commander", description: "The pinnacle of leadership and strategic genius. A Lord Commander does not just lead from the front; they become the heartbeat of the entire pertempuran. Under their command, common soldiers become legends, and the very air around them pulses with tactical might." },
    { id: 3105, name: "Archmage", description: "Having transcended the mortal limits of magical study, the Archmage is a walking conduit of pure arcane power. They no longer study spells; they understand the fundamental laws of reality and how to break them. An Archmage's magic is so potent that it ignores standard protections." }
  ];

  for (const c of classes) {
    // Only update the description and name to avoid overwriting other seeded fields
    await prisma.classTemplate.update({
      where: { id: c.id },
      data: { 
        name: c.name,
        description: c.description 
      }
    });
  }

  console.log("✅ Final Lore Codex v17.0 Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
