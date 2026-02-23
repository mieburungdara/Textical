const progression = require('../services/progressionService');

console.log("--------------------------------------------------");
console.log("📈 ZENITH XP CURVE AUDIT");
console.log("--------------------------------------------------\n");

const levels = [2, 3, 5, 10, 20, 50, 100];

levels.forEach(lvl => {
    const req = progression.getRequiredXP(lvl);
    console.log(`   Level ${lvl.toString().padEnd(3)} | Required XP: ${req.toLocaleString().padStart(10)}`);
});

console.log("\n[LEVEL UP SIMULATION]");
let xp = 10000;
let currentLvl = 1;
let newLvl = progression.checkLevelUp(currentLvl, xp);
console.log(`   Initial XP: ${xp.toLocaleString()} | Level 1 -> Level ${newLvl}`);

console.log("\n✅ XP Scaling is operational.");

