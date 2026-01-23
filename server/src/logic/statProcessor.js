const Stat = require('./stat');
const StatModifier = require('./statModifier');

class StatProcessor {
    static calculateHeroStats(heroData) {
        const stats = {
            health_max: new Stat(heroData.hp_base || 100),
            mana_max: new Stat(heroData.mana_base || 20),
            attack_damage: new Stat(heroData.damage_base || 10),
            defense: new Stat(heroData.defense_base || 0),
            speed: new Stat(heroData.speed_base || 5),
            attack_range: new Stat(heroData.range_base || 1),
            critical_chance: new Stat(heroData.crit_chance || 0),
            critical_damage: new Stat(heroData.crit_damage || 1.5),
            dodge_rate: new Stat(heroData.dodge_chance || 0),
            hp_regen: new Stat(heroData.hp_regen || 0),
            mana_regen: new Stat(heroData.mana_regen || 2)
        };

        if (heroData.hp_bonus) stats.health_max.addModifier(new StatModifier(heroData.hp_bonus, StatModifier.Type.FLAT, "Potential"));
        if (heroData.damage_bonus) stats.attack_damage.addModifier(new StatModifier(heroData.damage_bonus, StatModifier.Type.FLAT, "Potential"));
        if (heroData.speed_bonus) stats.speed.addModifier(new StatModifier(heroData.speed_bonus, StatModifier.Type.FLAT, "Potential"));

        if (heroData.current_job && heroData.current_job.id) {
            const job = heroData.current_job;
            // Primary Mults
            if (job.hp_mult) stats.health_max.addModifier(new StatModifier(job.hp_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"));
            if (job.mana_mult) stats.mana_max.addModifier(new StatModifier(job.mana_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"));
            if (job.damage_mult) stats.attack_damage.addModifier(new StatModifier(job.damage_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"));
            if (job.speed_mult) stats.speed.addModifier(new StatModifier(job.speed_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"));
            if (job.range_bonus) stats.attack_range.addModifier(new StatModifier(job.range_bonus, StatModifier.Type.FLAT, "Job"));
            
            // SECONDARY JOB MULTS (Restored)
            if (job.crit_mult) stats.critical_chance.addModifier(new StatModifier(job.crit_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"));
            if (job.dodge_mult) stats.dodge_rate.addModifier(new StatModifier(job.dodge_mult - 1.0, StatModifier.Type.PERCENT_ADD, "Job"));
        }

        if (heroData.equipment) {
            for (let slotId in heroData.equipment) {
                const itemInst = heroData.equipment[slotId];
                if (itemInst && itemInst.data && itemInst.data.stat_bonuses) {
                    for (let sName in itemInst.data.stat_bonuses) {
                        const targetKey = this._mapStatKey(sName);
                        if (stats[targetKey]) stats[targetKey].addModifier(new StatModifier(itemInst.data.stat_bonuses[sName], StatModifier.Type.FLAT, "Item"));
                    }
                }
            }
        }

        const result = { final_stats: {}, all_traits: [...(heroData.traits || [])] };
        for (let key in stats) { result.final_stats[key] = stats[key].getValue(); }
        return result;
    }

    static _mapStatKey(key) {
        const map = { "hp_max": "health_max", "atk": "attack_damage", "def": "defense", "spd": "speed", "crit": "critical_chance" };
        return map[key] || key;
    }
}

module.exports = StatProcessor;
