const prisma = require('../db');
const formationService = require('./formationService');
const vitalityService = require('./vitalityService');
const inventoryService = require('./inventoryService');
const BattleSimulation = require('../logic/battleSimulation');
const btManager = require('../logic/bt/BTManager');
const fs = require('fs');
const path = require('path');

class BattleService {
    constructor() {
        this.BATTLE_VITALITY_COST = 5;
        this.GRID_WIDTH = 50;
        this.GRID_HEIGHT = 50;
        
        // Load AI Trees
        try {
            const simpleAIPath = path.join(__dirname, '../logic/bt/SimpleAI.json');
            if (fs.existsSync(simpleAIPath)) {
                const simpleAI = JSON.parse(fs.readFileSync(simpleAIPath, 'utf8'));
                btManager.loadTree('SimpleAI', simpleAI);
                console.log("[BT] SimpleAI Loaded.");
            }
        } catch (e) { 
            console.error("[BT] Error loading AI trees:", e.message); 
        }
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

        // 3. Setup Simulation
        const regionTemplate = await prisma.regionTemplate.findUnique({
            where: { id: user.currentRegion },
            include: { type: { include: { effects: true } } }
        });
        
        const regionType = regionTemplate ? regionTemplate.visualType : "FOREST";
        const terrainEffects = regionTemplate && regionTemplate.type ? regionTemplate.type.effects : [];
        
        const sim = new BattleSimulation(this.GRID_WIDTH, this.GRID_HEIGHT, regionType);
        sim.terrainEffects = terrainEffects;

        // Add Heroes with SimpleAI
        party.forEach(p => {
            const stats = {
                health_max: p.profile.totalStats.HP || 100,
                mana_max: p.profile.totalStats.MP || 50,
                attack_damage: p.profile.totalStats.ATK || 10,
                defense: p.profile.totalStats.DEF || 5,
                speed: p.profile.totalStats.SPD || 10,
                attack_range: p.profile.totalStats.RANGE || 1,
                crit_chance: 0.05,
                crit_damage: 1.5,
                dodge_rate: 5
            };
            
            sim.addUnit({
                instance_id: `hero_${p.profile.name.replace(/\s+/g, '_')}_${Math.random().toString(36).substr(2, 5)}`,
                name: p.profile.name,
                bt_tree: "SimpleAI",
                skills: [
                    { id: 1, name: "Shield Bash", range: 1, aoe_pattern: "SQUARE", aoe_size: 0, damage_multiplier: 0.5, mana_cost: 20, status_effect: { type: "STUN", duration: 2 } }
                ]
            }, 0, { x: p.grid.x, y: p.grid.y }, stats);
        });

        // Add Monsters with SimpleAI
        const monsterStats = {
            health_max: monsterTemplate.hp_base,
            mana_max: 100,
            attack_damage: monsterTemplate.damage_base,
            defense: Math.floor(monsterTemplate.damage_base * 0.2),
            speed: 8,
            attack_range: 1,
            crit_chance: 0.02,
            crit_damage: 1.2,
            dodge_rate: 2
        };

        sim.addUnit({
            instance_id: `monster_${monsterTemplate.id}_${Math.random().toString(36).substr(2, 5)}`,
            id: monsterTemplate.id,
            name: monsterTemplate.name,
            bt_tree: monsterTemplate.behaviorTree, // <--- DINAMIS DARI DATABASE
            exp_reward: 20,
            skills: [
                { id: 101, name: "Fire Breath", range: 3, aoe_pattern: "CIRCLE", aoe_size: 1, damage_multiplier: 1.2, mana_cost: 0, status_effect: { type: "BURN", power: 10, duration: 3 } }
            ]
        }, 1, { x: 25, y: 5 }, monsterStats);

        // 4. Run Simulation
        const battleResult = sim.run();

        // 5. Process Rewards
        let lootEarned = [];
        if (battleResult.winner === 0) { 
            for (const entry of monsterTemplate.loot) {
                if (Math.random() < entry.chance) {
                    try {
                        await inventoryService.addItem(userId, entry.itemId, 1);
                        lootEarned.push({ templateId: entry.itemId, quantity: 1 });
                    } catch (e) { /* Inventory full */ }
                }
            }
            if (battleResult.rewards.gold > 0) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { gold: { increment: battleResult.rewards.gold } }
                });
            }
        }

        return {
            result: battleResult.winner === 0 ? "VICTORY" : "DEFEAT",
            replay: battleResult.logs,
            loot: lootEarned,
            rewards: battleResult.rewards,
            initialUnits: sim.units.map(u => ({
                id: u.instanceId,
                name: u.data.name,
                team: u.teamId === 0 ? "PLAYER" : "MONSTER",
                maxHp: u.stats.health_max,
                x: u.gridPos.x,
                y: u.gridPos.y
            }))
        };
    }
}

module.exports = new BattleService();