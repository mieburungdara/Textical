const BattleSimulation = require('../../../logic/battleSimulation');
const formationService = require('../../formationService');
const spiritService = require('../../SpiritService');
const contextService = require('../BattleContextService');
const unitFactory = require('../BattleUnitFactory');

class HordeBattleInitializer {
    constructor(db) {
        this.db = db;
        this.GRID_WIDTH = 50;
        this.GRID_HEIGHT = 50;
    }

    async execute(userId, monsterTemplateIds, snapshotUserPotions) {
        // 1. Fetch Context
        const user = await contextService.getUserContext(userId);
        const preset = user.formationPresets[0];
        if (!preset) throw new Error("No formation presets found.");

        const envContext = await contextService.getEnvironmentContext(user.currentRegion);
        const potionSnapshot = await snapshotUserPotions(userId);

        // 2. Setup Simulation
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

        // 3. Add Heroes (Team 0)
        let party = await formationService.getPartyProfile(preset.id);
        
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

        // 4. Add Monsters (Team 1)
        for (const tid of monsterTemplateIds) {
            const monsterTemplate = await this.db.monsterTemplate.findUnique({
                where: { id: tid },
                include: { traits: { include: { trait: true } } }
            });
            if (!monsterTemplate) continue;

            const unit = unitFactory.prepareMonsterUnit(monsterTemplate, envContext, { x: 25, y: 5 });
            await sim.addUnit(unit.config, 1, unit.position, unit.stats);
        }

        return { sim, potionSnapshot };
    }
}

module.exports = HordeBattleInitializer;
