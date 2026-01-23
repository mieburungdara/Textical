const Stat = require('./stat');
const StatModifier = require('./statModifier');

class StatProcessor {
    /**
     * Professional Stat Processor using mapping and functional patterns.
     * @param {Object} heroData 
     */
    static calculateHeroStats(heroData) {
        // 1. Initialize Stat instances
        const stats = {
            health_max: new Stat(heroData.hp_base || 100),
            mana_max: new Stat(heroData.mana_base || 20),
            attack_damage: new Stat(heroData.damage_base || 10),
            defense: new Stat(heroData.defense_base || 0),
            speed: new Stat(heroData.speed_base || 5),
            attack_range: new Stat(heroData.range_base || 1),
            dodge_rate: new Stat(heroData.dodge_chance || 0),
            crit_chance: new Stat(heroData.crit_chance || 0.05),
            crit_damage: new Stat(heroData.crit_damage || 1.5),
            hp_regen: new Stat(heroData.hp_regen || 0),
            mana_regen: new Stat(heroData.mana_regen || 2),
            block_chance: new Stat(heroData.block_chance || 0),
            res_fire: new Stat(heroData.res_fire || 1.0),
            res_water: new Stat(heroData.res_water || 1.0),
            res_wind: new Stat(heroData.res_wind || 1.0),
            res_earth: new Stat(heroData.res_earth || 1.0),
            res_lightning: new Stat(heroData.res_lightning || 1.0)
        };

        // Helper to apply modifiers cleanly
        const applyMod = (statKey, val, type, src) => {
            if (val != null && stats[statKey]) {
                stats[statKey].addModifier(new StatModifier(val, type, src));
            }
        };

        // 1. Apply Hero Potentials (Flat)
        applyMod('health_max', heroData.hp_bonus, StatModifier.Type.FLAT, "Potential");
        applyMod('attack_damage', heroData.damage_bonus, StatModifier.Type.FLAT, "Potential");
        applyMod('speed', heroData.speed_bonus, StatModifier.Type.FLAT, "Potential");

        // 2. Apply Job Multipliers (Mapped)
        if (heroData.current_job) {
            const job = heroData.current_job;
            const jobMap = {
                hp_mult: ['health_max', StatModifier.Type.PERCENT_ADD],
                damage_mult: ['attack_damage', StatModifier.Type.PERCENT_ADD],
                mana_mult: ['mana_max', StatModifier.Type.PERCENT_ADD],
                speed_mult: ['speed', StatModifier.Type.PERCENT_ADD],
                range_bonus: ['attack_range', StatModifier.Type.FLAT],
                crit_mult: ['crit_chance', StatModifier.Type.PERCENT_ADD],
                dodge_mult: ['dodge_rate', StatModifier.Type.PERCENT_ADD]
            };

            Object.entries(jobMap).forEach(([key, [target, type]]) => {
                const val = (type === StatModifier.Type.PERCENT_ADD) ? (job[key] - 1.0) : job[key];
                applyMod(target, val, type, "Job");
            });
        }

        // 3. Apply Equipment (Loop)
        if (heroData.equipment) {
            Object.values(heroData.equipment).forEach(item => {
                const bonuses = item?.data?.stat_bonuses;
                if (!bonuses) return;
                
                Object.entries(bonuses).forEach(([sName, val]) => {
                    const target = sName === "hp_max" ? "health_max" : sName;
                    applyMod(target, val, StatModifier.Type.FLAT, "Item");
                });
            });
        }

        // 4. Transform to final values
        return Object.fromEntries(Object.entries(stats).map(([k, s]) => {
            const isFloat = k.startsWith("res_") || k.includes("chance") || k.includes("rate") || k.includes("damage");
            // Preserve float precision for multipliers/chances if no modifiers exist
            return [k, (isFloat && s.modifiers.length === 0) ? s.baseValue : s.getValue()];
        }));
    }
}

module.exports = StatProcessor;
