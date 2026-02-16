const BattleSimulation = require('../../../logic/battleSimulation');
const formationService = require('../../formationService');
const contextService = require('../BattleContextService');
const unitFactory = require('../BattleUnitFactory');

class PvpBattleInitializer {
    constructor(db) {
        this.db = db;
        this.GRID_WIDTH = 50;
        this.GRID_HEIGHT = 50;
    }

    async execute(attackerId, defenderId, regionId) {
        // 1. Fetch Users & Context
        const attacker = await this.db.user.findUnique({
            where: { id: attackerId },
            include: { formationPresets: { include: { slots: true } } }
        });
        const defender = await this.db.user.findUnique({
            where: { id: defenderId },
            include: { formationPresets: { include: { slots: true } } }
        });

        if (!attacker || !defender) throw new Error("Attacker or Defender not found.");

        const attackerPreset = attacker.formationPresets[0];
        const defenderPreset = defender.formationPresets[0];

        if (!attackerPreset || !defenderPreset) throw new Error("Formation presets missing for one or both players.");

        const envContext = await contextService.getEnvironmentContext(regionId);

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
            manaStaticIntensity: envContext.manaStaticIntensity
        });

        // 3. Add Attacker Units (Team 0)
        const attackerParty = await formationService.getPartyProfile(attackerPreset.id);
        for (let i = 0; i < attackerParty.length; i++) {
            const p = attackerParty[i];
            const unit = unitFactory.prepareHeroUnit(p.profile, envContext, { x: 10 + (i % 5) * 5, y: 40 + Math.floor(i / 5) * 5 });
            // Custom ID for PvP
            unit.config.instance_id = `pvp_u0_h${p.profile.id}_${Math.random().toString(36).slice(2, 7)}`;
            await sim.addUnit(unit.config, 0, unit.position, unit.stats);
        }

        // 4. Add Defender Units (Team 1)
        const defenderParty = await formationService.getPartyProfile(defenderPreset.id);
        for (let i = 0; i < defenderParty.length; i++) {
            const p = defenderParty[i];
            const unit = unitFactory.prepareHeroUnit(p.profile, envContext, { x: 10 + (i % 5) * 5, y: 5 + Math.floor(i / 5) * 5 });
            // Custom ID for PvP
            unit.config.instance_id = `pvp_u1_h${p.profile.id}_${Math.random().toString(36).slice(2, 7)}`;
            await sim.addUnit(unit.config, 1, unit.position, unit.stats);
        }

        return { sim };
    }
}

module.exports = PvpBattleInitializer;
