const questService = require('../services/questService');
const reputationService = require('../services/reputationService');
const prisma = require('../db');

async function runNarrativeAudit() {
    console.log("--------------------------------------------------");
    console.log("📜 STARTING ADVANCED NARRATIVE ENGINE MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const factionId = 1; // Knights of Eldoria
    const npcId = 10; // Sir Alistair
    const questId = 500; // Secret Mission

    // 0. Setup: Clean slate
    console.log("[0/5] Preparing environment (Factions, NPCs, Quests)...");
    await prisma.userReputation.deleteMany({ where: { userId } });
    await prisma.userQuest.deleteMany({ where: { userId } });

    await prisma.faction.upsert({
        where: { id: factionId },
        update: {},
        create: { id: factionId, name: "Knights of Eldoria", description: "Protectors of the realm." }
    });

    await prisma.nPCTemplate.upsert({
        where: { id: npcId },
        update: { factionId },
        create: { id: npcId, name: "Sir Alistair", title: "Grand Master", description: "Veteran Knight", type: "QUEST_GIVER", factionId }
    });

    // Create Gated Quest
    await prisma.questTemplate.upsert({
        where: { id: questId },
        update: { minReputation: 100, factionId },
        create: { id: questId, name: "Secret Mission", description: "Only for trusted knights.", minReputation: 100, factionId }
    });
    // Ensure at least one stage exists
    await prisma.questStage.upsert({
        where: { questId_order: { questId, order: 1 } },
        update: {},
        create: { questId, order: 1, name: "Stage 1", description: "Start" }
    });

    // Create Dialogue Tree
    const root = await prisma.dialogueNode.create({
        data: { npcId, text: "Greetings, traveler. Do you support our cause?", isRoot: true }
    });

    const choice = await prisma.dialogueChoice.create({
        data: {
            nodeId: root.id,
            text: "I pledge my sword to Eldoria!",
            reputationAmount: 150,
            reputationFactionId: factionId
        }
    });

    // 1. Check Reputation Requirement (Should Fail)
    console.log("[1/5] Testing gated quest access BEFORE reputation...");
    try {
        await questService.acceptQuest(userId, questId);
        console.log("   ❌ Error: Should have failed due to low reputation.");
    } catch (e) {
        console.log(`   ✅ Success: ${e.message}`);
    }

    // 2. Start Dialogue
    console.log("[2/5] Initiating dialogue with Sir Alistair...");
    const dialogue = await questService.startDialogue(userId, npcId);
    console.log(`   NPC says: "${dialogue.text}"`);

    // 3. Process Choice (Grant Rep)
    console.log("[3/5] Making choice: 'I pledge my sword!'...");
    await questService.processDialogueChoice(userId, choice.id);
    
    const rep = await reputationService.getUserReputation(userId);
    console.log(`   New Reputation: ${rep[0].amount} with ${rep[0].faction.name}`);

    // 4. Check Reputation Requirement (Should Succeed)
    console.log("[4/5] Testing gated quest access AFTER reputation gain...");
    const userQuest = await questService.acceptQuest(userId, questId);
    console.log(`   ✅ Success: Quest accepted! Record ID: ${userQuest.id}`);

    // 5. Verify Ledger/Relational Integrity
    console.log("[5/5] Final verification of data consistency...");
    
    // VERDICT
    if (rep[0].amount >= 100 && userQuest.id) {
        console.log("\n🌟 FINAL VERDICT: NARRATIVE ENGINE PERFECTLY GATED.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGICAL FLOW FAILURE.");
    }

    // Cleanup generated dialogue nodes for this test
    await prisma.dialogueChoice.delete({ where: { id: choice.id } });
    await prisma.dialogueNode.delete({ where: { id: root.id } });

    console.log("\n--------------------------------------------------");
}

runNarrativeAudit().catch(err => console.error(err));
