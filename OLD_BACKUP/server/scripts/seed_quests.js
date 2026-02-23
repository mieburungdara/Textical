/**
 * Quest Seed Script
 * Seeds sample quests with NPC relationships into the database
 */

const prisma = require('../src/db');

const SAMPLE_QUESTS = [
    {
        id: 10,
        name: "The Dragon's Trial",
        description: "Prove your worth through travel, combat, and diplomacy.",
        isDynamic: false,
        questGiverId: 16,  // Quest Giver NPC
        turnInNpcId: 16,   // Same NPC for turn-in
        stages: [
            {
                order: 1,
                name: "Journey to the Ancient Ruins",
                description: "Travel east to find the ancient ruins where the dragon sleeps.",
                objectives: [
                    { type: "TRAVEL", targetId: 3, amount: 1, description: "Reach the Ancient Ruins (Region 3)" }
                ],
                rewards: [
                    { type: "EXP", amount: 100 }
                ]
            },
            {
                order: 2,
                name: "Slay the Guardians",
                description: "Defeat the stone guardians protecting the dragon's lair.",
                objectives: [
                    { type: "KILL", targetId: 6001, amount: 3, description: "Defeat 3 Green Slimes" }
                ],
                rewards: [
                    { type: "EXP", amount: 150 }
                ]
            },
            {
                order: 3,
                name: "Face the Dragon",
                description: "Challenge the dragon and prove your valor.",
                objectives: [
                    { type: "KILL", targetId: 9999, amount: 1, description: "Defeat the Dragon" }
                ],
                rewards: [
                    { type: "EXP", amount: 500 },
                    { type: "ITEM", itemId: 7501, amount: 1, description: "Dragon Scale Armor" }
                ]
            }
        ]
    },
    {
        id: 11,
        name: "Gather Herbs for the Healer",
        description: "Help the village healer by gathering rare medicinal herbs.",
        isDynamic: false,
        questGiverId: 1,   // Healer NPC
        turnInNpcId: 1,    // Same NPC for turn-in
        stages: [
            {
                order: 1,
                name: "Collect Moon Flowers",
                description: "Moon flowers only bloom at night in the forest.",
                objectives: [
                    { type: "GATHER", targetId: 7001, amount: 5, description: "Collect 5 Moon Flowers" }
                ],
                rewards: [
                    { type: "EXP", amount: 50 },
                    { type: "GOLD", amount: 25 }
                ]
            },
            {
                order: 2,
                name: "Find Dragon's Breath",
                description: "The healer needs dragon's breath herb from the volcano region.",
                objectives: [
                    { type: "GATHER", targetId: 7003, amount: 3, description: "Collect 3 Dragon's Breath" }
                ],
                rewards: [
                    { type: "EXP", amount: 75 },
                    { type: "GOLD", amount: 50 }
                ]
            },
            {
                order: 3,
                name: "Return to the Healer",
                description: "Deliver the herbs to the village healer.",
                objectives: [
                    { type: "TALK", targetId: 1, amount: 1, description: "Talk to Healer NPC" }
                ],
                rewards: [
                    { type: "EXP", amount: 100 },
                    { type: "ITEM", itemId: 2200, amount: 1, description: "Minor Health Potion" }
                ]
            }
        ]
    },
    {
        id: 12,
        name: "Cave Spider Infestation",
        description: "The nearby cave is infested with dangerous spiders. Clear it out!",
        isDynamic: false,
        questGiverId: 21,  // Quest Giver NPC
        turnInNpcId: 21,   // Same NPC for turn-in
        stages: [
            {
                order: 1,
                name: "Enter the Cave",
                description: "Explore the dark cave and find the spider nest.",
                objectives: [
                    { type: "TRAVEL", targetId: 5, amount: 1, description: "Enter the Dark Cave (Region 5)" }
                ],
                rewards: [
                    { type: "EXP", amount: 30 }
                ]
            },
            {
                order: 2,
                name: "Exterminate Spiders",
                description: "Kill as many spiders as you can find.",
                objectives: [
                    { type: "KILL", targetId: 6002, amount: 5, description: "Defeat 5 Cave Spiders" }
                ],
                rewards: [
                    { type: "EXP", amount: 100 },
                    { type: "GOLD", amount: 40 }
                ]
            },
            {
                order: 3,
                name: "Destroy the Queen",
                description: "Find and kill the spider queen.",
                objectives: [
                    { type: "KILL", targetId: 9998, amount: 1, description: "Defeat the Spider Queen" }
                ],
                rewards: [
                    { type: "EXP", amount: 200 },
                    { type: "ITEM", itemId: 9401, amount: 1, description: "Spider Silk" }
                ]
            }
        ]
    },
    {
        id: 13,
        name: "Learn Your First Skill",
        description: "Visit the training master to learn your first combat skill.",
        isDynamic: true,
        expiresAt: null,
        questGiverId: 6,   // Training Master NPC
        turnInNpcId: 6,    // Same NPC for turn-in
        stages: [
            {
                order: 1,
                name: "Find the Training Master",
                description: "Speak with the training master in the town square.",
                objectives: [
                    { type: "TALK", targetId: 6, amount: 1, description: "Talk to Training Master" }
                ],
                rewards: []
            },
            {
                order: 2,
                name: "Practice Basic Attack",
                description: "Practice your basic attack on the training dummy.",
                objectives: [
                    { type: "USE_SKILL", targetId: 9001, amount: 10, description: "Use Basic Attack 10 times" }
                ],
                rewards: [
                    { type: "EXP", amount: 25 }
                ]
            },
            {
                order: 3,
                name: "Complete Training",
                description: "Return to the training master to receive your skill.",
                objectives: [
                    { type: "TALK", targetId: 6, amount: 1, description: "Talk to Training Master again" }
                ],
                rewards: [
                    { type: "SKILL", skillId: 9002, description: "Learn Power Strike" }
                ]
            }
        ]
    },
    {
        id: 14,
        name: "Bounty Hunt: Forest Bandits",
        description: "The town guard is offering a bounty on forest bandits.",
        isDynamic: true,
        expiresAt: null,
        questGiverId: 11,  // Captain of the Guard NPC
        turnInNpcId: 11,    // Same NPC for turn-in
        stages: [
            {
                order: 1,
                name: "Accept the Bounty",
                description: "Speak with the Captain of the Guard to accept the bounty.",
                objectives: [
                    { type: "TALK", targetId: 11, amount: 1, description: "Talk to Captain of the Guard" }
                ],
                rewards: []
            },
            {
                order: 2,
                name: "Hunt Bandits",
                description: "Find and defeat 5 forest bandits.",
                objectives: [
                    { type: "KILL", targetId: 9997, amount: 5, description: "Defeat 5 Forest Bandits" }
                ],
                rewards: [
                    { type: "EXP", amount: 150 },
                    { type: "GOLD", amount: 100 }
                ]
            },
            {
                order: 3,
                name: "Collect Reward",
                description: "Return to the Captain of the Guard to collect your reward.",
                objectives: [
                    { type: "TALK", targetId: 11, amount: 1, description: "Talk to Captain of the Guard" }
                ],
                rewards: [
                    { type: "GOLD", amount: 200 },
                    { type: "ITEM", itemId: 7502, amount: 1, description: "Guard's Shield" }
                ]
            }
        ]
    }
];

async function seedQuests() {
    console.log('🔄 Starting quest seeding with NPC relations...');
    
    let created = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const questData of SAMPLE_QUESTS) {
        try {
            // Check if quest already exists
            const existing = await prisma.questTemplate.findUnique({
                where: { id: questData.id }
            });
            
            if (existing) {
                // Update existing quest with NPC relations
                await prisma.questTemplate.update({
                    where: { id: questData.id },
                    data: {
                        name: questData.name,
                        description: questData.description,
                        category: questData.category || "MAIN",
                        isDynamic: questData.isDynamic,
                        expiresAt: questData.expiresAt,
                        questGiverId: questData.questGiverId,
                        turnInNpcId: questData.turnInNpcId
                    }
                });
                console.log(`🔄 Updated quest ${questData.id}: ${questData.name} (Category: ${questData.category || 'MAIN'})`);
                updated++;
                continue;
            }
            
            // Create new quest with stages
            await prisma.questTemplate.create({
                data: {
                    id: questData.id,
                    version: 1,
                    name: questData.name,
                    description: questData.description,
                    category: questData.category || "MAIN",
                    isDynamic: questData.isDynamic,
                    expiresAt: questData.expiresAt,
                    questGiverId: questData.questGiverId,
                    turnInNpcId: questData.turnInNpcId,
                    stages: {
                        create: questData.stages.map(stage => ({
                            order: stage.order,
                            name: stage.name,
                            description: stage.description,
                            objectives: {
                                create: stage.objectives.map(obj => ({
                                    type: obj.type,
                                    targetId: obj.targetId,
                                    amount: obj.amount,
                                    description: obj.description
                                }))
                            },
                            rewards: {
                                create: stage.rewards.map(reward => ({
                                    type: reward.type,
                                    itemId: reward.itemId || null,
                                    factionId: reward.factionId || null,
                                    amount: reward.amount
                                }))
                            }
                        }))
                    }
                }
            });
            
            console.log(`✅ Created quest ${questData.id}: ${questData.name} (Giver: NPC ${questData.questGiverId})`);
            created++;
            
        } catch (error) {
            console.error(`❌ Error processing quest ${questData.id}:`, error.message);
        }
    }
    
    console.log(`\n📊 Seeding complete:`);
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${created + updated + skipped}`);
}

seedQuests()
    .then(() => {
        console.log('\n✨ Done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
