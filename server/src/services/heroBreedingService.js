const BaseService = require('./BaseService');
const resolver = require('../logic/genetics/InheritanceResolver');
const economyService = require('./economyService');
const HeroBondResolver = require('./stat/HeroBondResolver');

/**
 * HeroBreedingService
 * Orchestrates the creation of new pahlawan generations.
 */
class HeroBreedingService extends BaseService {
    constructor() {
        super();
        this.BREEDING_COST = 5000; // Gold
    }

    async breedHeroes(userId, fatherId, motherId, childName) {
        const father = await this.db.hero.findUnique({
            where: { id: fatherId },
            include: { traits: true }
        });
        const mother = await this.db.hero.findUnique({
            where: { id: motherId },
            include: { traits: true }
        });

        if (!father || !mother) throw new Error("Parents not found.");
        if (father.userId !== userId || mother.userId !== userId) throw new Error("Unauthorized.");
        if (father.hasOffspring || mother.hasOffspring) throw new Error("Parents have already reached their offspring limit (1 per lifetime).");

        // 1. Resolve Genetics
        const childTraits = resolver.resolveTraits(father.traits, mother.traits);
        const { stats, generation } = resolver.calculateGenerationStats(father, mother);

        return await this.runTransaction(async (tx) => {
            // 2. Consume Gold
            await economyService.debitUser(userId, this.BREEDING_COST, "HERO_BREEDING", fatherId, "HERO");

            // 3. Create Child
            const child = await tx.hero.create({
                data: {
                    userId,
                    name: childName,
                    fatherId,
                    motherId,
                    generation,
                    classId: father.classId, // Inherit father's class by default
                    ...stats
                }
            });

            // 4. Map Traits
            for (const traitId of childTraits) {
                await tx.heroTrait.create({
                    data: { heroId: child.id, traitId }
                });
            }

            // 5. Mark Parents
            await tx.hero.update({ where: { id: fatherId }, data: { hasOffspring: true } });
            await tx.hero.update({ where: { id: motherId }, data: { hasOffspring: true } });

            this.log(`New Legend Born: ${childName} (Gen ${generation}) from Father ${fatherId} and Mother ${motherId}`, "Breeding");
            
            // 6. Recalculate Hero Bonds (party synergy)
            await HeroBondResolver.recalculateBonds(userId);
            
            return child;
        });
    }
}

module.exports = new HeroBreedingService();
