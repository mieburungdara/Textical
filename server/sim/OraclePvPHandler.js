const prisma = require('../src/db');
const BattleSimulation = require('../src/logic/battleSimulation');
const formationService = require('../src/services/formationService');
const vitalityService = require('../src/services/vitalityService');
const rewardProcessor = require('../src/services/battle/RewardProcessor');
const replayService = require('../src/services/battle/ReplayService');

/**
 * AAA OraclePvPHandler
 * Specialized orchestrator for simulating PvP between bots.
 */
class OraclePvPHandler {
    constructor() {
        this.BATTLE_VITALITY_COST = 10;
        this.GRID_WIDTH = 50;
        this.GRID_HEIGHT = 50;
    }

    async executePvP(attackerId, defenderId) {
        console.log(`   ⚔️  [PvP] Bot ${attackerId} is attacking Bot ${defenderId}...`);

        const attacker = await this._getBotProfile(attackerId);
        const defender = await this._getBotProfile(defenderId);

        if (!attacker || !defender) return;

        // 1. Consume Vitality
        await vitalityService.consumeVitality(attackerId, this.BATTLE_VITALITY_COST);

        // 2. Setup Simulation
        const sim = new BattleSimulation(this.GRID_WIDTH, this.GRID_HEIGHT, "ARENA");
        
        // Add Attacker Team (Team 0)
        for (const p of attacker.party) {
            await sim.addUnit(this._mapSimUnit(p), 0, { x: p.grid.x, y: p.grid.y }, this._mapSimStats(p));
        }

        // Add Defender Team (Team 1)
        for (const p of defender.party) {
            await sim.addUnit(this._mapSimUnit(p), 1, { x: 50 - p.grid.x, y: 50 - p.grid.y }, this._mapSimStats(p));
        }

        // 3. Run Simulation
        const battleResult = sim.run();
        await replayService.saveReplay(sim.battleId, battleResult.logs);

        // 4. Process Rewards (Red Zone / Bounty logic handled inside RewardProcessor)
        // We simulate defender as "monsterTemplate" but with userId
        const defenderMockTemplate = {
            id: 9999, // PvP Mock ID
            name: defender.user.username,
            userId: defenderId,
            loot: [] // Players don't drop fixed loot, they drop items via LootSession
        };

        const result = await rewardProcessor.process(attackerId, { ...battleResult, victimUserId: defenderId }, defenderMockTemplate, attacker.party.length);

        return { winner: battleResult.winner, battleId: sim.battleId };
    }

    async _getBotProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { formationPresets: { include: { slots: true } } }
        });
        if (!user || user.formationPresets.length === 0) return null;
        
        const party = await formationService.getPartyProfile(user.formationPresets[0].id);
        return { user, party };
    }

    _mapSimUnit(p) {
        return {
            instance_id: `bot_hero_${p.profile.id}`,
            db_id: p.profile.id,
            isMain: p.profile.isMain,
            name: p.profile.name,
            bt_tree: "SimpleAI",
            traits: p.profile.activeTraits,
            abilities: p.profile.abilities,
            equippedItems: p.profile.equippedItems
        };
    }

    _mapSimStats(p) {
        return {
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
    }
}

module.exports = new OraclePvPHandler();
