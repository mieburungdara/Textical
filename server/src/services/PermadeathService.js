/**
 * PermadeathService
 * Handles hero death and archiving logic.
 * Follows SRP - only responsible for permadeath and hero archival.
 */

const heroRepository = require('../repositories/heroRepository');

class PermadeathService {
    /**
     * Check if a hero is legendary (qualifies for Hall of Fame)
     * @param {Object} hero - Hero object
     * @returns {boolean}
     */
    isLegendary(hero) {
        return hero.level >= 100 && hero.classTier >= 3;
    }

    /**
     * Archive a legendary hero to Hall of Fame
     * @param {Object} hero - Hero object
     * @param {string} username - Owner's username
     * @param {string} deathReason - Reason for death
     */
    async archiveToHallOfFame(hero, username, deathReason) {
        await heroRepository.archiveToHallOfFame(hero, username, deathReason);
    }

    /**
     * Delete a hero permanently
     * @param {number} heroId - Hero ID to delete
     */
    async deleteHero(heroId) {
        await heroRepository.delete(heroId);
    }

    /**
     * Process death for a hero based on zone risk
     * @param {Object} hero - Hero object
     * @param {string} username - Owner's username
     * @param {string} zoneType - Type of zone (GREEN, BLUE, YELLOW, RED, BLACK)
     * @param {string} deathReason - Reason for death
     * @returns {Object} Death result
     */
    async processDeath(hero, username, zoneType = "GREEN", deathReason = "Killed in battle") {
        const result = {
            name: hero.name,
            isLegendary: this.isLegendary(hero),
            isMain: hero.isMain,
            archived: false,
            deleted: false,
            penaltyApplied: zoneType
        };

        // 1. BLACK ZONE: Permadeath for non-main units. Main unit survives but stripped (caller handles stripping).
        if (zoneType === 'BLACK') {
            if (hero.isMain) {
                 return { ...result, deleted: false, message: "Main unit respawns naked." };
            }
            if (result.isLegendary) {
                await this.archiveToHallOfFame(hero, username, deathReason);
                result.archived = true;
            }
            await this.deleteHero(hero.id);
            result.deleted = true;
            return result;
        }

        // 2. RED ZONE: Permadeath for non-main units ONLY
        if (zoneType === 'RED') {
            if (hero.isMain) {
                // Main hero survives in Red Zone (but penalty is inventory loss, handled in RewardService)
                return { ...result, deleted: false, message: "Main unit survived Red Zone penalty." };
            }
            if (result.isLegendary) {
                await this.archiveToHallOfFame(hero, username, deathReason);
                result.archived = true;
            }
            await this.deleteHero(hero.id);
            result.deleted = true;
            return result;
        }

        // 3. YELLOW/BLUE/GREEN: No permadeath (KO only)
        // KO state is usually handled by VitalityService/KOManager, so we just return survival
        return { ...result, deleted: false, message: "Unit survived (KO only)." };
    }
}

module.exports = new PermadeathService();
