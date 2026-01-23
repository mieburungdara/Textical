const { Stat, StatModifier } = require('../logic/statSystem'); // UPDATED
const raceBonuses = require('../data/race_bonuses.json');
const Registry = require('../data/registry');

class StatService {
    calculateHeroStats(heroData) {
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

        const applyMod = (statKey, val, type, src) => {
            if (val != null && stats[statKey]) {
                stats[statKey].addModifier(new StatModifier(val, type, src));
            }
        };

        const masterMap = {
            hp_mult: ['health_max', StatModifier.Type.PERCENT_ADD],
            damage_mult: ['attack_damage', StatModifier.Type.PERCENT_ADD],
            speed_mult: ['speed', StatModifier.Type.PERCENT_ADD],
            defense_mult: ['defense', StatModifier.Type.PERCENT_ADD],
            mana_mult: ['mana_max', StatModifier.Type.PERCENT_ADD],
            dodge_mult: ['dodge_rate', StatModifier.Type.PERCENT_ADD],
            crit_mult: ['crit_chance', StatModifier.Type.PERCENT_ADD],
            range_bonus: ['attack_range', StatModifier.Type.FLAT]
        };

        const processMap = (source, label) => {
            Object.entries(masterMap).forEach(([key, [target, type]]) => {
                if (source[key] !== undefined) {
                    const val = (type === StatModifier.Type.PERCENT_ADD) ? (source[key] - 1.0) : source[key];
                    applyMod(target, val, type, label);
                }
            });
        };

        if (heroData.race && raceBonuses[heroData.race]) processMap(raceBonuses[heroData.race], "Race");

        const allTraits = [...(heroData.naturalTraits || []), ...(heroData.acquiredTraits || [])];
        allTraits.forEach(tid => {
            const t = Registry.TRAITS[tid];
            if (t?.bonuses) processMap(t.bonuses, `Trait:${t.name}`);
        });

        if (heroData.current_job) processMap(heroData.current_job, "Job");

        if (heroData.equipment) {
            Object.values(heroData.equipment).forEach(item => {
                const bonuses = item?.data?.stat_bonuses || item?.stat_bonuses;
                if (bonuses) Object.entries(bonuses).forEach(([k, v]) => applyMod(k === "hp_max" ? "health_max" : k, v, StatModifier.Type.FLAT, "Item"));
            });
        }

        return Object.fromEntries(Object.entries(stats).map(([k, s]) => [k, s.getValue()]));
    }
}

module.exports = new StatService();