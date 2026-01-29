const express = require('express');
const router = express.Router();
const BattleSimulation = require('../logic/battleSimulation');

router.post('/run-test', async (req, res) => {
    try {
        const { customUnits, regionType } = req.body;
        const sim = new BattleSimulation(50, 50, regionType || "FOREST");
        
        if (customUnits && customUnits.length > 0) {
            customUnits.forEach(u => {
                sim.addUnit({
                    instance_id: u.id || `unit_${Math.random().toString(36).substr(2, 5)}`,
                    name: u.name || "Custom Unit",
                    race: u.race || "human",
                    traits: u.traits || [],
                    bt_tree: u.bt_tree || "SimpleAI",
                    skills: u.skills || []
                }, u.team || 0, u.pos || { x: 25, y: 25 }, u.stats);
            });
        } else {
            // Default fallback scenario if none provided
            sim.addUnit({ instance_id: "test_dummy", name: "Training Dummy", race: "human", traits: ["thorns"], bt_tree: "SimpleAI" }, 1, { x: 25, y: 10 }, { health_max: 1000, mana_max: 100, attack_damage: 10, defense: 10, speed: 5, attack_range: 1, dodge_rate: 0, crit_chance: 0, crit_damage: 1 });
        }

        const result = sim.run();
        res.json({
            battleId: sim.battleId,
            initialState: sim.units.map(u => ({
                id: u.instanceId,
                name: u.data.name,
                team: u.teamId,
                maxHp: u.stats.health_max,
                maxMp: u.stats.mana_max,
                traits: u.traits
            })),
            replay: result.logs
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;