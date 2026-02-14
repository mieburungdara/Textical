const prisma = require('./src/db');
const pvpService = require('./src/services/battle/PvpService');

async function verifyPvp() {
    console.log("--- ⚔️ VERIFYING PVP SYSTEM ⚔️ ---");

    // 1. Setup Test Data
    const attacker = await prisma.user.upsert({
        where: { username: "PvpAttacker" },
        update: { isPvpFlagged: false },
        create: { username: "PvpAttacker", password: "pwd", silver: 1000, isPvpFlagged: false }
    });
    const defender = await prisma.user.upsert({
        where: { username: "PvpDefender" },
        update: { isPvpFlagged: false },
        create: { username: "PvpDefender", password: "pwd", silver: 1000, isPvpFlagged: false }
    });

    // Create Regions with different modes
    const safeRegion = await prisma.regionTemplate.upsert({
        where: { id: 9001 },
        update: { pvpMode: 'SAFE' },
        create: { id: 9001, name: "Safe Haven", description: "Peaceful", pvpMode: 'SAFE' }
    });
    const consentRegion = await prisma.regionTemplate.upsert({
        where: { id: 9002 },
        update: { pvpMode: 'CONSENT' },
        create: { id: 9002, name: "Duel Grounds", description: "Fair play", pvpMode: 'CONSENT' }
    });
    const openRegion = await prisma.regionTemplate.upsert({
        where: { id: 9003 },
        update: { pvpMode: 'OPEN' },
        create: { id: 9003, name: "The Abyss", description: "Chaos", pvpMode: 'OPEN' }
    });

    // --- TEST 1: SAFE ZONE (Normal) ---
    console.log("\n[Test 1] Attacking in SAFE zone...");
    let result = await pvpService.canInitiatePvp(attacker.id, defender.id, safeRegion.id);
    console.log(`- Allowed: ${result.allowed}, Reason: ${result.reason}`);
    if (result.allowed === false) console.log("✅ PASS: Blocked correctly.");

    // --- TEST 2: OPEN ZONE ---
    console.log("\n[Test 2] Attacking in OPEN zone...");
    result = await pvpService.canInitiatePvp(attacker.id, defender.id, openRegion.id);
    console.log(`- Allowed: ${result.allowed}`);
    if (result.allowed === true) console.log("✅ PASS: Allowed correctly.");

    // --- TEST 3: CONSENT ZONE (Unflagged) ---
    console.log("\n[Test 3] Attacking in CONSENT zone (Both unflagged)...");
    result = await pvpService.canInitiatePvp(attacker.id, defender.id, consentRegion.id);
    console.log(`- Allowed: ${result.allowed}, Reason: ${result.reason}`);
    if (result.allowed === false) console.log("✅ PASS: Blocked correctly.");

    // --- TEST 4: CONSENT ZONE (Attacker Flagged, Defender Unflagged) ---
    console.log("\n[Test 4] Attacking in CONSENT zone (Attacker flagged)...");
    await pvpService.setPvpFlag(attacker.id, true);
    result = await pvpService.canInitiatePvp(attacker.id, defender.id, consentRegion.id);
    console.log(`- Allowed: ${result.allowed}, Reason: ${result.reason}`);
    if (result.allowed === false) console.log("✅ PASS: Blocked correctly.");

    // --- TEST 5: CONSENT ZONE (Both Flagged) ---
    console.log("\n[Test 5] Attacking in CONSENT zone (Both flagged)...");
    await pvpService.setPvpFlag(defender.id, true);
    result = await pvpService.canInitiatePvp(attacker.id, defender.id, consentRegion.id);
    console.log(`- Allowed: ${result.allowed}`);
    if (result.allowed === true) console.log("✅ PASS: Allowed correctly.");

    // --- TEST 6: TERRITORY STRUGGLE (SAFE ZONE OVERRIDE) ---
    console.log("\n[Test 6] Attacking in SAFE zone while UNDER SIEGE...");
    // Create/Update Territory for SAFE region
    const guild = await prisma.guild.findFirst() || await prisma.guild.create({
        data: { id: 8001, name: "TestGuild", description: "Test", treasury: 0, level: 1 }
    });
    
    await prisma.territory.upsert({
        where: { regionId: safeRegion.id },
        update: { siegeStatus: 'UNDER_SIEGE' },
        create: { regionId: safeRegion.id, guildId: guild.id, siegeStatus: 'UNDER_SIEGE' }
    });

    result = await pvpService.canInitiatePvp(attacker.id, defender.id, safeRegion.id);
    console.log(`- Allowed: ${result.allowed}, Reason: ${result.reason}`);
    if (result.allowed === true) console.log("✅ PASS: Siege override worked.");

    console.log("\n--- ⚔️ PVP VERIFICATION COMPLETE ⚔️ ---");
}

verifyPvp()
    .catch(e => console.error(e))
    .finally(async () => {
        // cleanup if needed
    });
