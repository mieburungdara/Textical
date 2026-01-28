const prisma = require('../db');
const formationService = require('./formationService');
const vitalityService = require('./vitalityService');
const inventoryService = require('./inventoryService');

class BattleService {
    constructor() {
        this.BATTLE_VITALITY_COST = 5;
        this.GRID_SIZE = 50;
        this.MAX_TICKS = 200;
    }

    async startBattle(userId, monsterTemplateId) {
        // 1. Fetch Context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { 
                formationPresets: { include: { slots: true } },
                taskQueue: { where: { status: "RUNNING" } }
            }
        });
        if (!user) throw new Error("User not found");
        if (user.taskQueue.length > 0) throw new Error("You are too busy to start a battle right now.");
        
        const preset = user.formationPresets[0];
        if (!preset) throw new Error("No formation presets found.");

        const monsterTemplate = await prisma.monsterTemplate.findUnique({
            where: { id: monsterTemplateId },
            include: { loot: true }
        });
        if (!monsterTemplate) throw new Error("Monster not found");

        const party = await formationService.getPartyProfile(preset.id);
        
        // 2. Resource Consumption
        await vitalityService.syncUserVitality(userId);
        await vitalityService.consumeVitality(userId, this.BATTLE_VITALITY_COST);

        // 3. Initialize Simulation State
        let units = [];
        
        // Add Heroes
        party.forEach(p => {
            units.push({
                id: `hero_${p.profile.name}`,
                team: "PLAYER",
                hp: 100,
                maxHp: 100,
                atk: p.profile.totalStats.ATK || 10,
                x: p.grid.x,
                y: p.grid.y,
                isDead: false,
                name: p.profile.name
            });
        });

        // Add Monster(s) - Positioned at top center for now
        units.push({
            id: `monster_${monsterTemplate.id}`,
            team: "MONSTER",
            hp: monsterTemplate.hp_base,
            maxHp: monsterTemplate.hp_base,
            atk: monsterTemplate.damage_base,
            x: 25,
            y: 5,
            isDead: false,
            name: monsterTemplate.name
        });

        const replay = [];
        let tick = 0;
        let victory = false;
        let defeat = false;

        // 4. Run Simulation
        while (tick < this.MAX_TICKS && !victory && !defeat) {
            const tickEvents = [];

            for (let unit of units) {
                if (unit.isDead) continue;

                // Find closest target
                const target = units
                    .filter(u => !u.isDead && u.team !== unit.team)
                    .sort((a, b) => {
                        const distA = Math.abs(unit.x - a.x) + Math.abs(unit.y - a.y);
                        const distB = Math.abs(unit.x - b.x) + Math.abs(unit.y - b.y);
                        return distA - distB;
                    })[0];

                if (!target) continue;

                const distX = Math.abs(unit.x - target.x);
                const distY = Math.abs(unit.y - target.y);

                if (distX <= 1 && distY <= 1) {
                    // ATTACK
                    target.hp -= unit.atk;
                    tickEvents.push({
                        type: "ATTACK",
                        attacker: unit.id,
                        target: target.id,
                        damage: unit.atk,
                        targetHp: Math.max(0, target.hp)
                    });

                    if (target.hp <= 0) {
                        target.isDead = true;
                        tickEvents.push({ type: "DEATH", unitId: target.id });
                    }
                } else {
                    // MOVE (Simple Greedy)
                    const oldX = unit.x;
                    const oldY = unit.y;
                    
                    if (distX > distY) {
                        unit.x += (target.x > unit.x ? 1 : -1);
                    } else {
                        unit.y += (target.y > unit.y ? 1 : -1);
                    }

                    tickEvents.push({
                        type: "MOVE",
                        unitId: unit.id,
                        from: [oldX, oldY],
                        to: [unit.x, unit.y]
                    });
                }
            }

            if (tickEvents.length > 0) {
                replay.push({ tick, events: tickEvents });
            }

            // Check Win/Loss
            victory = units.filter(u => u.team === "MONSTER").every(u => u.isDead);
            defeat = units.filter(u => u.team === "PLAYER").every(u => u.isDead);
            tick++;
        }

        // 5. Finalize Results
        const result = victory ? "VICTORY" : "DEFEAT";
        let lootEarned = [];

        if (result === "VICTORY") {
            for (const entry of monsterTemplate.loot) {
                if (Math.random() < entry.chance) {
                    try {
                        await inventoryService.addItem(userId, entry.itemId, 1);
                        lootEarned.push({ templateId: entry.itemId, quantity: 1 });
                    } catch (e) {
                        // Inventory full
                    }
                }
            }
        }

        return {
            result,
            ticks: tick,
            replay,
            loot: lootEarned,
            initialUnits: units.map(u => ({ ...u, hp: u.maxHp })) // Snapshot for UI init
        };
    }
}

module.exports = new BattleService();