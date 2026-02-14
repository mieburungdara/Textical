const BaseService = require('./BaseService');

/**
 * BanditService
 * Manages Ambush logic, Ransom (30%), and Bandit Reputation.
 */
class BanditService extends BaseService {
    constructor() {
        super();
        this.RANSOM_PERCENTAGE = 0.3; // 30% of total silver
        this.REPUTATION_CHANGE_RANSOM = -0.1; // Becomes "Prey" (negative reputation)
        this.REPUTATION_CHANGE_COMBAT_WIN = 0.15; // Becomes "Fear" (positive reputation)
    }

    /**
     * Calculate probability of ambush in a region
     * @param {number} userId
     * @param {number} regionId
     * @returns {Promise<number>}
     */
    async calculateAmbushChance(userId, regionId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            select: { banditReputation: true, escortGridsRemaining: true }
        });

        if (user.escortGridsRemaining > 0) return 0.0;

        const region = await this.db.regionTemplate.findUnique({
            where: { id: regionId },
            select: { banditThreatLevel: true }
        });

        if (!region) return 0.0;

        // Base chance + modifier from reputation
        // Positive reputation (Fear) reduces chance.
        // Negative reputation (Prey) increases chance.
        let finalChance = region.banditThreatLevel - (user.banditReputation * 0.2);
        
        return Math.max(0.0, Math.min(1.0, finalChance));
    }

    /**
     * Handle Ransom logic (User chooses to pay)
     * @param {number} userId
     * @returns {Promise<object>} Updated User
     */
    async processRansom(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            select: { silver: true, banditReputation: true }
        });

        const ransomAmount = Math.floor(user.silver * this.RANSOM_PERCENTAGE);
        
        return await this.db.user.update({
            where: { id: userId },
            data: {
                silver: { decrement: ransomAmount },
                banditReputation: { decrement: 0.1 } // Move towards "Prey"
            }
        });
    }

    /**
     * Handle Combat logic (User chooses to fight)
     * @param {number} userId
     * @returns {Promise<object>} Updated User
     */
    async processCombatVictory(userId) {
        return await this.db.user.update({
            where: { id: userId },
            data: {
                banditReputation: { increment: this.REPUTATION_CHANGE_COMBAT_WIN } // Move towards "Fear"
            }
        });
    }

    /**
     * Get dynamic ambient signs for high threat regions
     * @param {number} threatLevel
     * @returns {string|null}
     */
    getAmbientSigns(threatLevel) {
        if (threatLevel <= 0.4) return null;

        const signs = [
            "Pepohonan di sini memiliki sayatan vertikal yang aneh, seolah sengaja dibuat sebagai penanda.",
            "Keheningan di jalur ini terasa tidak alami; burung-burung seolah berhenti berkicau saat kamu lewat.",
            "Sisa-sisa kain kusam yang terikat di dahan pohon berkibar pelan, memberikan kesan wilayah ini telah diklaim.",
            "Bau asap dingin dari api unggun yang dipadamkan tercium samar di balik semak tebal.",
            "Banyak jejak kaki yang mengarah ke dalam kegelapan hutan, tapi tidak ada satu pun yang kembali keluar ke jalan utama.",
            "Ada perasaan bahwa banyak mata sedang mengawasimu dari balik bayang-bayang tebing."
        ];

        return signs[Math.floor(Math.random() * signs.length)];
    }
}

module.exports = new BanditService();
