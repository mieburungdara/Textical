const Stat = require('./stat');
const StatModifier = require('./statModifier');

class StatProcessor {
    /**
     * @param {Object} heroData 
     */
    static calculateHeroStats(heroData) {
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
            // ELEMENTAL RESISTANCES (1.0 = Neutral)
            res_fire: new Stat(heroData.res_fire || 1.0),
            res_water: new Stat(heroData.res_water || 1.0),
            res_wind: new Stat(heroData.res_wind || 1.0),
            res_earth: new Stat(heroData.res_earth || 1.0),
            res_lightning: new Stat(heroData.res_lightning || 1.0)
        };

        // 1. Potentials
        if (heroData.hp_bonus) stats.health_max.addModifier(new StatModifier(heroData.hp_bonus, StatModifier.Type.FLAT, "Potential"));
        if (heroData.damage_bonus) stats.attack_damage.addModifier(new StatModifier(heroData.damage_bonus, StatModifier.Type.FLAT, "Potential"));
        if (heroData.speed_bonus) stats.speed.addModifier(new StatModifier(heroData.speed_bonus, StatModifier.Type.FLAT, "Potential"));

        // 2. Job Multipliers
        if (heroData.current_job) {
            const job = heroData.current_job;
            if (job.hp_mult) stats.health_max.addModifier(new StatModifier(job.hp_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"));
            if (job.damage_mult) stats.attack_damage.addModifier(new StatModifier(job.damage_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"));
            if (job.mana_mult) stats.mana_max.addModifier(new StatModifier(job.mana_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"));
            if (job.speed_mult) stats.speed.addModifier(new StatModifier(job.speed_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"));
            if (job.range_bonus) stats.attack_range.addModifier(new StatModifier(job.range_bonus, StatModifier.Type.FLAT, "Job"));
            if (job.crit_mult) stats.crit_chance.addModifier(new StatModifier(job.crit_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"));
            if (job.dodge_mult) stats.dodge_rate.addModifier(new StatModifier(job.dodge_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"));
        }

        // 3. Equipment
        if (heroData.equipment) {
            for (let slotId in heroData.equipment) {
                const itemInst = heroData.equipment[slotId];
                if (itemInst && itemInst.data && itemInst.data.stat_bonuses) {
                    for (let sName in itemInst.data.stat_bonuses) {
                        let targetKey = sName;
                        if (sName === "hp_max") targetKey = "health_max";
                        if (stats[targetKey]) {
                            stats[targetKey].addModifier(new StatModifier(itemInst.data.stat_bonuses[sName], StatModifier.Type.FLAT, "Item"));
                        }
                    }
                }
            }
        }

        const result = {};
        for (let key in stats) {
            // For float-based stats, we use a specialized getter or handle here
            if (key.startsWith("res_") || key.includes("chance") || key.includes("rate") || key.includes("damage")) {
                // Get value without floor for multipliers
                result[key] = stats[key].modifiers.length > 0 ? stats[key].getValue() : stats[key].baseValue;
            } else {
                result[key] = stats[key].getValue();
            }
        }
        return result;
    }
}

module.exports = StatProcessor;