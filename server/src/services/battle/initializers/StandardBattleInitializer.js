const BattleSimulation = require('../../../logic/battleSimulation');
const formationService = require('../../formationService');
const vitalityService = require('../../vitalityService');
const worldSpawner = require('../../worldSpawnerService');
const spiritService = require('../../SpiritService');
const contextService = require('../BattleContextService');
const unitFactory = require('../BattleUnitFactory');

class StandardBattleInitializer {
    constructor(db) {
        this.db = db;
        this.BATTLE_VITALITY_COST = 5;
        this.GRID_WIDTH = 50;
        this.GRID_HEIGHT = 50;
    }

    async execute(userId, monsterTemplateId, snapshotUserPotions) {
        // 1. Fetch Context
        const user = await contextService.getUserContext(userId);
        if (user.taskQueue.length > 0) throw new Error("You are too busy to start a battle right now.");
        
        const preset = user.formationPresets[0];
        if (!preset) throw new Error("No formation presets found.");

        const availableMonsters = await worldSpawner.getAvailableMonsters(user.currentRegion);
        const isAvailable = availableMonsters.some(m => m.templateId === monsterTemplateId || `event_${m.id}` === monsterTemplateId);
        if (!isAvailable) throw new Error("Monster not currently available in this region.");

        const monsterTemplate = await this.db.monsterTemplate.findUnique({
            where: { id: monsterTemplateId },
            include: { loot: true, traits: { include: { trait: true } } }
        });
        if (!monsterTemplate) throw new Error("Monster not found");

        const envContext = await contextService.getEnvironmentContext(user.currentRegion);
        const potionSnapshot = await snapshotUserPotions(userId);

        // 2. Resource Consumption
        await vitalityService.syncUserVitality(userId);
        await vitalityService.consumeVitality(userId, this.BATTLE_VITALITY_COST);

        // 3. Setup Simulation
        const sim = new BattleSimulation({
            width: this.GRID_WIDTH,
            height: this.GRID_HEIGHT,
            regionType: envContext.regionType
        });

        Object.assign(sim, {
            currentHour: envContext.currentHour,
            weather: envContext.weather,
            moonPhase: envContext.moonPhase,
            terrainEffects: envContext.terrainEffects,
            potionSnapshot,
            userId,
            manaStaticIntensity: envContext.manaStaticIntensity,
            activeSpirit: await spiritService.getValidActiveSpirit(userId)
        });

        // 4. Add Units
        let party = await formationService.getPartyProfile(preset.id);
        
        // Auto-deploy fallback
        if (party.length === 0) {
            const ownedHeroes = await this.db.hero.findMany({ where: { userId } });
            for (let i = 0; i < ownedHeroes.length; i++) {
                const profile = await formationService.getHeroCombatProfile(ownedHeroes[i].id);
                const unit = unitFactory.prepareHeroUnit(profile, envContext, { x: 10 + (i % 5) * 5, y: 40 + Math.floor(i / 5) * 5 });
                await sim.addUnit(unit.config, 0, unit.position, unit.stats);
            }
        } else {
            for (const p of party) {
                const unit = unitFactory.prepareHeroUnit(p.profile, envContext, p.grid);
                await sim.addUnit(unit.config, 0, unit.position, unit.stats);
            }
        }

        // Add Monster
        const monsterUnit = unitFactory.prepareMonsterUnit(monsterTemplate, envContext, { x: 25, y: 5 });
        // Specific skill for standard monster (keep original behavior)
        monsterUnit.config.skills = [
            { id: 101, name: "Fire Breath", range: 3, aoe_pattern: "CIRCLE", aoe_size: 1, damage_multiplier: 1.2, mana_cost: 0, status_effect: { type: "BURN", power: 10, duration: 3 } }
        ];
        await sim.addUnit(monsterUnit.config, 1, monsterUnit.position, monsterUnit.stats);

        return { sim, monsterTemplate, potionSnapshot };
    }
}

module.exports = StandardBattleInitializer;
