/**
 * StatAllocationService
 * Manages hero stat point allocation and resets.
 * Single Responsibility: Handle stat points mechanics.
 */
const BaseService = require('../BaseService');

class StatAllocationService extends BaseService {
    /**
     * Create the allocation service.
     * @param {Object} calculationEngine - Reference to StatCalculationEngine.
     * @param {Object} historyService - Reference to StatHistoryService.
     */
    constructor(calculationEngine, historyService) {
        super();
        this.calculationEngine = calculationEngine;
        this.historyService = historyService;
    }

    /**
     * Allocate stat points to a specific stat.
     * @param {number} heroId - Hero ID.
     * @param {string} statName - Stat name (str, dex, int, vit, luk).
     * @param {number} points - Points to allocate.
     * @param {Object} options - Options.
     * @returns {Promise<Object>} Allocation result with updated stats.
     */
    async allocateStat(heroId, statName, points, options = {}) {
        const result = await this.runTransaction(async (tx) => {
        const hero = await this.calculationEngine.fetchHeroData(heroId);
            if (!hero) {
                throw new Error('Hero not found');
            }
            
            const allocation = await this._getOrInitializeAllocation(hero, tx);
            
            const availablePoints = allocation.availablePoints || 0;
            const currentAllocated = allocation[`${statName}Allocated`] || 0;
            
            if (points > availablePoints) {
                throw new Error(`Insufficient points. Available: ${availablePoints}, Requested: ${points}`);
            }
            
            // Access caps via engine's resolver
            const caps = this.calculationEngine.statCapResolver.getCaps(hero);
            const statCap = caps[statName]?.max || 255;
            
            if (currentAllocated + points > statCap) {
                throw new Error(`Stat cap exceeded for ${statName}. Current: ${currentAllocated}, Cap: ${statCap}`);
            }
            
            const updatedAllocation = await tx.heroStatAllocation.update({
                where: { id: allocation.id },
                data: {
                    [`${statName}Allocated`]: currentAllocated + points,
                    availablePoints: availablePoints - points,
                    totalSpent: (allocation.totalSpent || 0) + points
                }
            });
            
            await tx.heroStatAudit.create({
                data: {
                    heroId,
                    changeType: 'ALLOCATION',
                    statName,
                    previousValue: currentAllocated,
                    newValue: currentAllocated + points,
                    notes: `Allocated ${points} points to ${statName}`
                }
            });
            
            this.calculationEngine.invalidateHeroCache(heroId);
            
            const updatedStats = await this.calculationEngine.calculateStatsWithBreakdown(heroId);
            
            return {
                success: true,
                allocation: updatedAllocation,
                stats: updatedStats
            };
        });

        if (result.success) {
            this.historyService.saveStatSnapshot(heroId, 'ALLOCATION').catch(console.error);
        }

        return result;
    }

    /**
     * Allocate multiple stats at once (Atomic).
     * @param {number} heroId - Hero ID.
     * @param {Object} batch - Allocations { str: 5, dex: 10, ... }.
     * @returns {Promise<Object>} Result of batch allocation.
     */
    async batchAllocateStats(heroId, batch) {
        const result = await this.runTransaction(async (tx) => {
        const hero = await this.calculationEngine.fetchHeroData(heroId);
            if (!hero) throw new Error('Hero not found');
            
            const allocation = await this._getOrInitializeAllocation(hero, tx);

            const totalRequested = Object.values(batch).reduce((sum, p) => sum + p, 0);
            if (totalRequested > (allocation.availablePoints || 0)) {
                throw new Error(`Insufficient points. Available: ${allocation.availablePoints}, Requested: ${totalRequested}`);
            }

            const caps = this.calculationEngine.statCapResolver.getCaps(hero);
            const updates = {
                availablePoints: allocation.availablePoints - totalRequested,
                totalSpent: (allocation.totalSpent || 0) + totalRequested
            };

            for (const [statName, points] of Object.entries(batch)) {
                if (points <= 0) continue;
                
                const currentAllocated = allocation[`${statName}Allocated`] || 0;
                const statCap = caps[statName]?.max || 255;
                
                if (currentAllocated + points > statCap) {
                    throw new Error(`Stat cap exceeded for ${statName}. Current: ${currentAllocated}, Cap: ${statCap}`);
                }
                
                updates[`${statName}Allocated`] = currentAllocated + points;

                await tx.heroStatAudit.create({
                    data: {
                        heroId,
                        changeType: 'ALLOCATION',
                        statName,
                        previousValue: currentAllocated,
                        newValue: currentAllocated + points,
                        notes: `Batch allocation: +${points} to ${statName}`
                    }
                });
            }

            const updatedAllocation = await tx.heroStatAllocation.update({
                where: { id: allocation.id },
                data: updates
            });

            this.calculationEngine.invalidateHeroCache(heroId);
            const updatedStats = await this.calculationEngine.calculateStatsWithBreakdown(heroId);

            return {
                success: true,
                allocation: updatedAllocation,
                stats: updatedStats
            };
        });

        if (result.success) {
            this.historyService.saveStatSnapshot(heroId, 'BATCH_ALLOCATION').catch(console.error);
        }

        return result;
    }

    /**
     * Reset all stat allocations for a hero.
     * @param {number} heroId - Hero ID.
     * @returns {Promise<Object>} Reset result.
     */
    async resetStatAllocation(heroId) {
        const result = await this.runTransaction(async (tx) => {
        const hero = await this.calculationEngine.fetchHeroData(heroId);
            if (!hero) throw new Error('Hero not found');
            
            const allocation = hero.statAllocation;
            if (!allocation) {
                return {
                    success: true,
                    pointsRefunded: 0,
                    message: "No stat allocation found to reset"
                };
            }

            const primaryStats = ['str', 'dex', 'int', 'vit', 'luk'];
            let pointsRefunded = 0;
            const updates = {
                availablePoints: allocation.availablePoints,
                totalSpent: 0,
                lastResetAt: new Date()
            };

            for (const stat of primaryStats) {
                const allocated = allocation[`${stat}Allocated`] || 0;
                if (allocated > 0) {
                    pointsRefunded += allocated;
                    updates[`${stat}Allocated`] = 0;
                    
                    await tx.heroStatAudit.create({
                        data: {
                            heroId,
                            changeType: 'RESET',
                            statName: stat,
                            previousValue: allocated,
                            newValue: 0,
                            notes: `Reset ${stat} allocation`
                        }
                    });
                }
            }

            updates.availablePoints += pointsRefunded;

            const updatedAllocation = await tx.heroStatAllocation.update({
                where: { id: allocation.id },
                data: updates
            });

            this.calculationEngine.invalidateHeroCache(heroId);
            const updatedStats = await this.calculationEngine.calculateStatsWithBreakdown(heroId);

            return {
                success: true,
                pointsRefunded,
                allocation: updatedAllocation,
                stats: updatedStats
            };
        });

        if (result.success && result.pointsRefunded > 0) {
            this.historyService.saveStatSnapshot(heroId, 'RESET').catch(console.error);
        }

        return result;
    }

    /**
     * Get stat capabilities for a hero.
     * @param {number} heroId - Hero ID.
     * @returns {Promise<Object>} Stat caps, available points, growth info.
     */
    async getStatCapabilities(heroId) {
        const hero = await this.calculationEngine.fetchHeroData(heroId);
        if (!hero) {
            throw new Error('Hero not found');
        }
        
        const caps = this.calculationEngine.statCapResolver.getCaps(hero);
        const allocation = hero.statAllocation || {};
        
        const primaryStats = ['str', 'dex', 'int', 'vit', 'luk'];
        const statDetails = {};
        
        for (const stat of primaryStats) {
            const current = hero[stat] || 10;
            const allocated = allocation[`${stat}Allocated`] || 0;
            const cap = caps[stat]?.max || 255;
            
            statDetails[stat] = {
                base: current,
                allocated,
                currentTotal: current + allocated,
                cap,
                remaining: cap - (current + allocated),
                growthRate: hero.combatClass?.statAllocationTemplate?.[`${stat}GrowthFactor`] || 1.0,
                growthCurve: hero.combatClass?.statAllocationTemplate?.[`${stat}GrowthCurve`] || 'LINEAR'
            };
        }
        
        return {
            availablePoints: allocation.availablePoints || 0,
            totalSpent: primaryStats.reduce((sum, stat) => 
                sum + (allocation[`${stat}Allocated`] || 0), 0),
            statCaps: caps.primary || {},
            secondaryCaps: caps.secondary || {},
            attributes: statDetails,
            recommendedDistribution: this._getRecommendedDistribution(hero),
            levelScaling: {
                currentLevel: hero.unitLevel,
                pointsPerLevel: hero.combatClass?.statPointsPerLevel || 3,
                totalPointsFromLevels: (hero.unitLevel - 1) * (hero.combatClass?.statPointsPerLevel || 3)
            }
        };
    }

    /**
     * Get or initialize stat allocation record for a hero.
     * @param {Object} hero - Hero data.
     * @param {Object} tx - Transaction context.
     * @returns {Promise<Object>} Allocation record.
     * @private
     */
    async _getOrInitializeAllocation(hero, tx) {
        if (hero.statAllocation) return hero.statAllocation;

        const db = tx || this.db;
        let allocation = await db.heroStatAllocation.findUnique({
            where: { heroId: hero.id }
        });

        if (allocation) return allocation;

        const template = await db.statAllocationTemplate.findUnique({
            where: { classId: hero.classId }
        });

        const basePoints = template?.basePointsPerLevel || 5;
        const initialPoints = (hero.unitLevel || 1) * basePoints;

        return await db.heroStatAllocation.create({
            data: {
                heroId: hero.id,
                availablePoints: initialPoints,
                totalSpent: 0,
                strAllocated: 0,
                dexAllocated: 0,
                intAllocated: 0,
                vitAllocated: 0,
                lukAllocated: 0
            }
        });
    }

    /**
     * Get recommended stat distribution.
     * @param {Object} hero - Hero data.
     * @returns {Object} Recommended distribution.
     * @private
     */
    _getRecommendedDistribution(hero) {
        const className = hero.combatClass?.name?.toLowerCase() || '';
        
        const recommendations = {
            warrior: { str: 3, vit: 2, dex: 1, int: 0, luk: 1 },
            knight: { str: 2, vit: 3, dex: 1, int: 0, luk: 1 },
            mage: { int: 4, dex: 1, vit: 1, str: 0, luk: 1 },
            archer: { dex: 3, int: 1, vit: 1, str: 1, luk: 1 },
            rogue: { dex: 3, luk: 2, str: 1, vit: 1, int: 0 },
            paladin: { str: 2, vit: 2, int: 1, dex: 1, luk: 1 },
            default: { str: 1, vit: 1, dex: 1, int: 1, luk: 1 }
        };
        
        for (const [key, value] of Object.entries(recommendations)) {
            if (className.includes(key)) {
                return value;
            }
        }
        
        return recommendations.default;
    }
}

module.exports = StatAllocationService;
