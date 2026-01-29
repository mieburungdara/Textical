const { Stat, StatModifier } = require('../logic/statSystem');
const raceBonuses = require('../data/race_bonuses.json');
const Registry = require('../data/registry');
const statGrowthSystem = require('./stat/StatGrowthSystem');
const prisma = require('../db');

class StatService {
    async calculateHeroStats(heroId) {
        // Fetch hero with class template
        const heroData = await prisma.hero.findUnique({
            where: { id: heroId },
            include: { combatClass: true }
        });

        if (!heroData) throw new Error("Hero not found");

        // 1. Initialize Primary Attributes
        const primary = {
            str: new Stat(heroData.str || 10),
            dex: new Stat(heroData.dex || 10),
            int: new Stat(heroData.int || 10),
            vit: new Stat(heroData.vit || 10)
        };

        // 2. Initialize Secondary Stats
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
            accuracy: new Stat(heroData.accuracy_base || 100),
            armor_penetration: new Stat(heroData.ar_pen_base || 0),
            skill_power: new Stat(heroData.skill_power_base || 10),
            tenacity: new Stat(heroData.tenacity_base || 0),
            block_power: new Stat(heroData.block_power_base || 0.5),
            initiative: new Stat(heroData.initiative_base || 0),
            lifesteal_rate: new Stat(heroData.lifesteal_base || 0)
        };

        const applyMod = (statKey, val, type, src) => {
            if (val != null && stats[statKey]) {
                stats[statKey].addModifier(new StatModifier(val, type, src));
            }
        };

        // 3. Apply Class Growth (AAA: Level-based gains)
        statGrowthSystem.applyGrowth(stats, heroData.combatClass, heroData.level);

        // 4. AAA SCALING LOGIC (Mapping Primary to Secondary)
        const s = primary.str.getValue();
        const d = primary.dex.getValue();
        const i = primary.int.getValue();
        const v = primary.vit.getValue();

        applyMod('attack_damage', s * 0.5, 0, "Attribute:STR");
        applyMod('block_power', s * 0.01, 0, "Attribute:STR");
        applyMod('accuracy', d * 2, 0, "Attribute:DEX");
        applyMod('dodge_rate', d * 0.5, 0, "Attribute:DEX");
        applyMod('speed', d * 0.1, 0, "Attribute:DEX");
        applyMod('skill_power', i * 1.5, 0, "Attribute:INT");
        applyMod('mana_max', i * 5, 0, "Attribute:INT");
        applyMod('health_max', v * 10, 0, "Attribute:VIT");
        applyMod('tenacity', v * 0.5, 0, "Attribute:VIT");

        // 5. Finalize Stats
        const finalStats = Object.fromEntries(Object.entries(stats).map(([k, s]) => [k, s.getValue()]));
        finalStats.attributes = { str: s, dex: d, int: i, vit: v };

        return finalStats;
    }
}

module.exports = new StatService();