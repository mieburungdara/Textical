const BaseService = require('../BaseService');
const BattleSimulation = require('../../logic/battleSimulation');
const formationService = require('../formationService');
const vitalityService = require('../vitalityService');
const worldSpawner = require('../worldSpawnerService');

class BattleInitializer extends BaseService {
    constructor() {
        super();
        this.BATTLE_VITALITY_COST = 5;
        this.GRID_WIDTH = 50;
        this.GRID_HEIGHT = 50;
    }

    async setupSimulation(userId, monsterTemplateId) {
        // 1. Fetch Context
        const user = await this.db.user.findUnique({
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

        // AAA: Resolve monster via WorldSpawner (supports dynamic phenomenal spawns)
        const availableMonsters = await worldSpawner.getAvailableMonsters(user.currentRegion);
        const isAvailable = availableMonsters.some(m => m.templateId === monsterTemplateId || `event_${m.id}` === monsterTemplateId);
        
        if (!isAvailable) throw new Error("Monster not currently available in this region.");

        const monsterTemplate = await this.db.monsterTemplate.findUnique({
            where: { id: monsterTemplateId },
            include: { loot: true, traits: { include: { trait: true } } }
        });
        if (!monsterTemplate) throw new Error("Monster not found");

        const party = await formationService.getPartyProfile(preset.id);
        
        // 2. Resource Consumption
        await vitalityService.syncUserVitality(userId);
        await vitalityService.consumeVitality(userId, this.BATTLE_VITALITY_COST);

        // 3. Setup Simulation
        const regionTemplate = await this.db.regionTemplate.findUnique({
            where: { id: user.currentRegion },
            include: { type: { include: { effects: true } } }
        });
        
        const regionType = regionTemplate ? regionTemplate.visualType : "FOREST";
        const terrainEffects = regionTemplate && regionTemplate.type ? regionTemplate.type.effects : [];
        
        const sim = new BattleSimulation(this.GRID_WIDTH, this.GRID_HEIGHT, regionType);
        sim.terrainEffects = terrainEffects;

        // Add Heroes
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
                dodge_rate: 5,
                accuracy: 100,
                initiative: 0,
                block_chance: 0.1,
                block_power: 0.5
            };
            
            sim.addUnit({
                instance_id: `hero_${p.profile.name.replace(/\s+/g, '_')}_${Math.random().toString(36).substr(2, 5)}`,
                db_id: p.profile.id, // Keep track of DB ID for persistence
                isMain: p.profile.isMain, // AAA: Unit Utama Identification
                name: p.profile.name,
                bt_tree: "SimpleAI",
                traits: p.profile.activeTraits,
                abilities: p.profile.abilities,
                equippedItems: p.profile.equippedItems // AAA: Durability Support
            }, 0, { x: p.grid.x, y: p.grid.y }, stats);
        });

        // Add Monsters
        const monsterStats = {
            health_max: monsterTemplate.hp_base,
            mana_max: 100,
            attack_damage: monsterTemplate.damage_base,
            defense: Math.floor(monsterTemplate.damage_base * 0.2),
            speed: 8,
            attack_range: 1,
            crit_chance: 0.02,
            crit_damage: 1.2,
            dodge_rate: 2,
            accuracy: 90,
            initiative: 0,
            block_chance: 0.05,
            block_power: 0.3
        };

        sim.addUnit({
            instance_id: `monster_${monsterTemplate.id}_${Math.random().toString(36).substr(2, 5)}`,
            id: monsterTemplate.id,
            name: monsterTemplate.name,
            bt_tree: monsterTemplate.behaviorTree, 
            traits: monsterTemplate.traits.map(t => t.trait.name),
            exp_reward: 20,
            skills: [
                { id: 101, name: "Fire Breath", range: 3, aoe_pattern: "CIRCLE", aoe_size: 1, damage_multiplier: 1.2, mana_cost: 0, status_effect: { type: "BURN", power: 10, duration: 3 } }
            ]
        }, 1, { x: 25, y: 5 }, monsterStats);

        return { sim, monsterTemplate };
    }
}

module.exports = new BattleInitializer();
