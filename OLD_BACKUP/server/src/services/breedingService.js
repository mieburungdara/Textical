const _ = require('lodash');
const unitNames = require('../data/unit_names.json');

class BreedingManager {
    /**
     * AAA Breeding Engine with specific inheritance ratios.
     * @param {Object} father - Father hero object with relational traits array.
     * @param {Object} mother - Mother hero object with relational traits array.
     * @returns {Object} Child data object for hero creation.
     */
    generateChild(father, mother) {
        if (father.gender !== 'MALE' || mother.gender !== 'FEMALE') {
            throw new Error('Invalid parent genders for breeding.');
        }

        // 1. GENDER ROLL: 50% Male, 50% Female
        const gender = Math.random() < 0.50 ? 'MALE' : 'FEMALE';

        // 2. TRAIT INHERITANCE from relational HeroTrait array
        // traits relation: [{ traitTemplateId, ... }]
        const fatherTraitIds = (father.traits || []).map(t => t.traitTemplateId);
        const motherTraitIds = (mother.traits || []).map(t => t.traitTemplateId);
        const inheritedTraitIds = [];

        // Roll for Father's traits (70% success)
        fatherTraitIds.forEach(traitId => {
            if (Math.random() < 0.70) inheritedTraitIds.push(traitId);
        });

        // Roll for Mother's traits (30% success)
        motherTraitIds.forEach(traitId => {
            if (Math.random() < 0.30) inheritedTraitIds.push(traitId);
        });

        // Remove duplicates
        const finalTraitIds = _.uniq(inheritedTraitIds);

        // 3. STAT MIXING: Weighted average + 5% mutation using direct numeric columns
        const childStats = {};
        const statKeys = ['hp_base', 'damage_base', 'speed_base', 'str', 'dex', 'int', 'def'];
        statKeys.forEach(key => {
            const fVal = father[key] || 0;
            const mVal = mother[key] || 0;
            // Stats lean towards father (60/40 split)
            const weightedAvg = (fVal * 0.6) + (mVal * 0.4);
            childStats[key] = Math.floor(weightedAvg * 1.05);
        });

        // 4. RACE & NAME
        const race = Math.random() < 0.5 ? father.race : mother.race;
        const raceKey = race.toLowerCase();
        const raceData = unitNames.races[raceKey];
        const fName = raceData.first_names[Math.floor(Math.random() * raceData.first_names.length)];
        const lName = father.name.split(' ').pop();
        const fullName = `${fName} ${lName}`;

        return {
            name: fullName,
            gender,
            race,
            baseStats: childStats,
            inheritedTraitIds,
            fatherId: father.id,
            motherId: mother.id,
            generation: Math.max(father.generation, mother.generation) + 1
        };
    }
}

module.exports = new BreedingManager();