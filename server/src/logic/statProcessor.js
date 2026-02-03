/**
 * Stat Processor - Calculates hero stats from base values, jobs, and equipment
 */

class StatProcessor {
    /**
     * Calculate hero stats from hero data
     * @param {Object} heroData - Hero data with base stats, job, and equipment
     * @returns {Object} Calculated stats
     */
    static calculateHeroStats(heroData) {
        const stats = {};

        // Calculate health
        if (heroData.hp_base !== undefined) {
            let health = heroData.hp_base;
            if (heroData.current_job && heroData.current_job.hp_mult) {
                health *= heroData.current_job.hp_mult;
            }
            stats.health_max = Math.floor(health);
        }

        // Calculate attack damage
        if (heroData.damage_base !== undefined) {
            let damage = heroData.damage_base;
            if (heroData.current_job && heroData.current_job.damage_mult) {
                damage *= heroData.current_job.damage_mult;
            }
            if (heroData.equipment && heroData.equipment.weapon && 
                heroData.equipment.weapon.data && heroData.equipment.weapon.data.stat_bonuses) {
                damage += heroData.equipment.weapon.data.stat_bonuses.attack_damage || 0;
            }
            stats.attack_damage = Math.floor(damage);
        }

        // Calculate speed
        if (heroData.speed_base !== undefined) {
            stats.speed = heroData.speed_base;
        }

        return stats;
    }
}

module.exports = StatProcessor;