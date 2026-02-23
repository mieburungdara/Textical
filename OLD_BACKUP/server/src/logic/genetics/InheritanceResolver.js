/**
 * AAA InheritanceResolver
 * Pure logic for genetic inheritance and generation bonuses.
 * Decoupled from DB for high-fidelity simulation testing.
 */
class InheritanceResolver {
    constructor() {
        this.FATHER_CHANCE = 0.70; // 70% Father
        this.MOTHER_CHANCE = 0.30; // 30% Mother
        this.MUTATION_BONUS_PER_GEN = 0.05; // +5% cumulative
    }

    /**
     * Resolves which traits the child inherits.
     */
    resolveTraits(fatherTraits, motherTraits) {
        const childTraitIds = new Set();
        const allParentTraits = [...fatherTraits, ...motherTraits];
        
        // Logic: For each unique trait present in parents, roll for inheritance
        const uniqueTraits = [...new Set(allParentTraits.map(t => t.traitId))];

        for (const traitId of uniqueTraits) {
            const isFromFather = fatherTraits.some(t => t.traitId === traitId);
            const isFromMother = motherTraits.some(t => t.traitId === traitId);

            let chance = 0;
            if (isFromFather && isFromMother) chance = 0.90; // Strong synergy
            else if (isFromFather) chance = this.FATHER_CHANCE;
            else if (isFromMother) chance = this.MOTHER_CHANCE;

            if (Math.random() < chance) {
                childTraitIds.add(traitId);
            }
        }

        return Array.from(childTraitIds);
    }

    /**
     * Calculates base stats for a child based on parents and generation.
     */
    calculateGenerationStats(father, mother) {
        const nextGen = Math.max(father.generation, mother.generation) + 1;
        const multiplier = 1 + ((nextGen - 1) * this.MUTATION_BONUS_PER_GEN);

        // Average of parents * multiplier
        const stats = {
            hp_base: Math.floor(((father.hp_base + mother.hp_base) / 2) * multiplier),
            damage_base: Math.floor(((father.damage_base + mother.damage_base) / 2) * multiplier),
            str: Math.floor(((father.str + mother.str) / 2) * multiplier),
            dex: Math.floor(((father.dex + mother.dex) / 2) * multiplier),
            int: Math.floor(((father.int + mother.int) / 2) * multiplier),
            vit: Math.floor(((father.vit + mother.vit) / 2) * multiplier)
        };

        return { stats, generation: nextGen };
    }
}

module.exports = new InheritanceResolver();
