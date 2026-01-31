const npcBehavior = require('../services/npc/NPCBehaviorService');
const npcService = require('../services/npcService');
const eventService = require('../services/eventService');
const prisma = require('../db');

async function runNPCAudit() {
    console.log("--------------------------------------------------");
    console.log("🤖 STARTING ADVANCED NPC AI MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const npcId = 10; // Sir Alistair (acting as Zev for this test)
    const townRegion = 1;
    const tavernRegion = 5; // Assuming Region 5 is a Tavern
    const eventId = 1; // Standard Event Template

    // 0. Setup: Clean schedules and reactions
    console.log("[0/5] Preparing NPC schedules and event reactions...");
    await prisma.nPCSchedule.deleteMany({ where: { npcId } });
    await prisma.nPCEventReaction.deleteMany({ where: { npcId } });
    await prisma.activeEvent.deleteMany({ where: { regionId: townRegion } });

    // Schedule: Hour 8-18 in Town, Hour 19-7 in Tavern
    await prisma.nPCSchedule.create({ data: { npcId, hourStart: 8, hourEnd: 18, targetRegionId: townRegion } });
    await prisma.nPCSchedule.create({ data: { npcId, hourStart: 19, hourEnd: 7, targetRegionId: tavernRegion } });

    // Event Reaction: If Event 1 active, move to Region 1 and override dialogue
    await prisma.nPCEventReaction.create({
        data: { npcId, eventTemplateId: eventId, actionType: "MOVE", targetRegionId: townRegion, overrideDialogueId: 999 }
    });

    // 1. Test Daytime Schedule
    console.log("[1/5] Testing Day Schedule (Hour 12)...");
    const dayPresence = await npcBehavior.resolveNPCPresence(npcId, 12);
    console.log(`   Location: Region ${dayPresence.regionId} (Expected: 1)`);

    // 2. Test Nighttime Schedule
    console.log("[2/5] Testing Night Schedule (Hour 22)...");
    const nightPresence = await npcBehavior.resolveNPCPresence(npcId, 22);
    console.log(`   Location: Region ${nightPresence.regionId} (Expected: 5)`);

    // 3. Test Event Override (Override Night Schedule)
    console.log("[3/5] Triggering World Event (Trader Festival)...");
    await eventService.triggerEvent(eventId, townRegion, 60);
    
    // Even at night (Hour 22), the event should pull him to Town
    const eventPresence = await npcBehavior.resolveNPCPresence(npcId, 22);
    console.log(`   Location during Event: Region ${eventPresence.regionId} (Expected: 1)`);
    console.log(`   Status: ${eventPresence.status} (Expected: EVENT_REACTION)`);

    // 4. Test Service Integration (Dialogue Override)
    console.log("[4/5] Checking dynamic dialogue via NPCService...");
    // Mock the current hour by injecting it if service supported it, 
    // for this test we'll assume the service uses system time.
    const npcsInRegion = await npcService.getAvailableNPCs(townRegion);
    const zev = npcsInRegion.find(n => n.templateId === npcId);
    console.log(`   NPC Dialogue: "${zev.description}"`);

    // 5. Final Data Integrity
    console.log("[5/5] Verifying logical consistency...");

    // VERDICT
    const schedulePass = dayPresence.regionId === townRegion && nightPresence.regionId === tavernRegion;
    const eventPass = eventPresence.status === "EVENT_REACTION" && eventPresence.regionId === townRegion;
    const dialoguePass = zev.description.includes("EVENT");

    if (schedulePass && eventPass && dialoguePass) {
        console.log("\n🌟 FINAL VERDICT: ADVANCED NPC AI PERFECTLY AUTONOMOUS.");
    } else {
        console.log("\n❌ FINAL VERDICT: AI LOGIC FAILURE.");
    }

    // Cleanup
    await prisma.activeEvent.deleteMany({ where: { regionId: townRegion } });
    console.log("\n--------------------------------------------------");
}

runNPCAudit().catch(err => console.error(err));
