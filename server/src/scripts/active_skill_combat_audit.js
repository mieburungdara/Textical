const battleService = require('../services/battleService');
const prisma = require('../db');

async function runSkillCombatAudit() {
    console.log("--------------------------------------------------");
    console.log("⚔️ STARTING ACTIVE SKILL COMBAT INTEGRATION AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const wolfId = 6003; // Forest Wolf

    // 1. Get the real Hero ID from user's formation
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { formationPresets: { include: { slots: true } } }
    });
    
    const heroId = user.formationPresets[0].slots[0].heroId;
    const hero = await prisma.hero.findUnique({ where: { id: heroId } });
    console.log(`[1/4] Ensuring Hero ${hero.name} (ID: ${heroId}) has 'Power Strike' unlocked...`);

    // 2. Ensure Hero has "Power Strike" (ID 9101)
    await prisma.heroSkill.upsert({
        where: { heroId_skillId: { heroId, skillId: 9101 } },
        update: { isActive: true },
        create: { heroId, skillId: 9101, isActive: true }
    });

    // 3. Clear other tasks and verify energy
    await prisma.user.update({ where: { id: userId }, data: { vitality: 100 } });
    await prisma.taskQueue.deleteMany({ where: { userId, status: "RUNNING" } });

    // 4. Start Battle
    console.log("[2/4] Starting Battle simulation...");
    const battle = await battleService.startBattle(userId, wolfId);
    
    console.log(`   Battle Result: ${battle.result}`);

    // 5. Check Replay Logs for Skill Usage
    console.log("[3/4] Analyzing battle logs for 'SKILL' events...");
    
    // Flatten all events from all ticks
    const allEvents = battle.replay.flatMap(tick => tick.events);
    const skillEvents = allEvents.filter(e => e.type === "SKILL");
    
    if (skillEvents.length > 0) {
        console.log(`   ✅ SUCCESS: Skill used ${skillEvents.length} times.`);
        skillEvents.forEach(e => console.log(`      > ${e.msg}`));
    } else {
        console.log("   ❌ FAILURE: No skill usage detected in battle logs.");
    }

    // 6. Final Verdict
    if (skillEvents.length > 0) {
        console.log("\n🌟 FINAL VERDICT: ACTIVE SKILL COMBAT INTEGRATION COMPLETE.");
    } else {
        console.log("\n❌ FINAL VERDICT: SYSTEM NOT TRIGGERING SKILLS.");
    }

    console.log("\n--------------------------------------------------");
}

runSkillCombatAudit().catch(err => console.error(err));
