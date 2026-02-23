/**
 * AAA ConflictDetector
 * Pure component for identifying regional hotspots based on faction parity.
 */
class ConflictDetector {
    constructor() {
        this.MIN_CONFLICT_POINTS = 2000;
        this.MAX_PARITY_GAP = 1000; // Points must be within this range to be "contested"
    }

    /**
     * Scans regional influence data to identify potential conflict zones.
     * Returns a list of region IDs and the participating factions.
     */
    detectConflicts(influenceMap, factionRelations) {
        const potentialHotspots = [];

        // influenceMap is grouped by regionId: { regionId: [{factionId, points}, ...] }
        for (const regionId of Object.keys(influenceMap)) {
            const regionInfluence = influenceMap[regionId];
            if (regionInfluence.length < 2) continue;

            // Sort by points desc
            const sorted = [...regionInfluence].sort((a, b) => b.points - a.points);
            const top = sorted[0];
            const runnerUp = sorted[1];

            // Parity Check: Both must be high, and gap must be small
            if (top.points >= this.MIN_CONFLICT_POINTS && runnerUp.points >= this.MIN_CONFLICT_POINTS) {
                const gap = top.points - runnerUp.points;
                if (gap <= this.MAX_PARITY_GAP) {
                    // Check if they are actually at war
                    const relation = factionRelations[`${Math.min(top.factionId, runnerUp.factionId)}_${Math.max(top.factionId, runnerUp.factionId)}`];
                    
                    if (relation === "WAR") {
                        potentialHotspots.push({
                            regionId: parseInt(regionId),
                            factionA: top.factionId,
                            factionB: runnerUp.factionId,
                            intensity: top.points + runnerUp.points
                        });
                    }
                }
            }
        }

        return potentialHotspots;
    }
}

module.exports = new ConflictDetector();
