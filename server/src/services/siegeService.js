const siegeRepository = require('../repositories/siegeRepository');
const battleService = require('./battleService');
const heroRepository = require('../repositories/heroRepository');
const prisma = new (require('@prisma/client').PrismaClient)();

class SiegeService {
    /**
     * Simulates an entire Siege Battle.
     * Logic: 5 Rounds of Team Battles. Best of 5 wins the Territory.
     */
    async simulateSiege(siegeId) {
        const siege = await siegeRepository.getSiegeById(siegeId);
        if (!siege || siege.status !== "ACTIVE") throw new Error("Siege is not active.");

        console.log(`[SIEGE] War starting: ${siege.attacker.name} vs ${siege.defender ? siege.defender.name : 'Neutral'}`);

        let attackerWins = 0;
        let defenderWins = 0;
        let logs = [];

        // 1. Get Top Heroes for both sides
        const attackerHeroes = await this._getGuildChampions(siege.attackerId);
        const defenderHeroes = siege.defenderId ? await this._getGuildChampions(siege.defenderId) : [];

        // 2. Simulate 5 Tactical Rounds
        for (let i = 1; i <= 5; i++) {
            const roundWinner = this._simulateRound(attackerHeroes, defenderHeroes, i);
            if (roundWinner === "ATTACKER") attackerWins++;
            else defenderWins++;
            
            logs.push({ round: i, winner: roundWinner });
        }

        // 3. Determine Final Winner
        const finalWinnerId = attackerWins > defenderWins ? siege.attackerId : siege.defenderId;
        
        // 4. Persistence: Update Siege Results
        await siegeRepository.updateStatus(siegeId, "FINISHED", finalWinnerId, JSON.stringify(logs));

        // 5. Transfer Territory Ownership
        if (finalWinnerId === siege.attackerId) {
            await siegeRepository.transferOwnership(siege.regionId, finalWinnerId);
            console.log(`[GEOPOLITICS] ${siege.attacker.name} has captured ${siege.region.name}!`);
        } else {
            console.log(`[GEOPOLITICS] ${siege.defender.name} successfully defended ${siege.region.name}.`);
        }

        return { winnerId: finalWinnerId, score: `${attackerWins}-${defenderWins}` };
    }

    async _getGuildChampions(guildId) {
        // Fetch top 5 heroes from the entire guild membership based on Level
        return await prisma.hero.findMany({
            where: { user: { guildId: guildId } },
            orderBy: { level: 'desc' },
            take: 5
        });
    }

    _simulateRound(atkTeam, defTeam, roundNum) {
        // For Siege simulation, we aggregate team power vs team power
        const atkPower = atkTeam.reduce((sum, h) => sum + h.level, 0);
        const defPower = defTeam.length > 0 ? defTeam.reduce((sum, h) => sum + h.level, 0) : 50; // Base neutral defense

        // Add variance (±20% luck factor)
        const atkFinal = atkPower * (0.8 + Math.random() * 0.4);
        const defFinal = defPower * (0.8 + Math.random() * 0.4);

        return atkFinal > defFinal ? "ATTACKER" : "DEFENDER";
    }
}

module.exports = new SiegeService();
