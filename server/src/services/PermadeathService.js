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
     * Process death for a hero
     * @param {Object} hero - Hero object
     * @param {string} username - Owner's username
     * @param {string} deathReason - Reason for death
     * @returns {Object} Death result with isLegendary flag
     */
    async processDeath(hero, username, deathReason = "Killed in battle") {
        const result = {
            name: hero.name,
            isLegendary: this.isLegendary(hero),
            archived: false,
            deleted: false
        };

        if (result.isLegendary) {
            await this.archiveToHallOfFame(hero, username, deathReason);
            result.archived = true;
        }

        await this.deleteHero(hero.id);
        result.deleted = true;

        return result;
    }
}

module.exports = new PermadeathService();
