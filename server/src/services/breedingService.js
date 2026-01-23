const _ = require('lodash');
const unitNames = require('../data/unit_names.json');

class BreedingManager {
    /**
     * AAA Breeding Engine with specific inheritance ratios.
     * @param {Object} father 
     * @param {Object} mother 
     */
    generateChild(father, mother) {
        if (father.gender !== "MALE" || mother.gender !== "FEMALE") {
            throw new Error("Invalid parent genders for breeding.");
        }

        // 1. GENDER ROLL: 50% Male, 50% Female (as requested)
        const gender = Math.random() < 0.50 ? "MALE" : "FEMALE";

        // 2. TRAIT INHERITANCE: 70% from Father, 30% from Mother
        const fatherTraits = JSON.parse(father.naturalTraits || "[]");
        const motherTraits = JSON.parse(mother.naturalTraits || "[]");
        const inheritedTraits = [];

        // Roll for Father's traits (70% success)
        fatherTraits.forEach(trait => {
            if (Math.random() < 0.70) inheritedTraits.push(trait);
        });

        // Roll for Mother's traits (30% success)
        motherTraits.forEach(trait => {
            if (Math.random() < 0.30) inheritedTraits.push(trait);
        });

        // Remove duplicates if both parents had the same trait
        const finalTraits = _.uniq(inheritedTraits);

        // 3. STAT MIXING: Weighted average + 5% mutation
        const fStats = JSON.parse(father.baseStats);
        const mStats = JSON.parse(mother.baseStats);
        const childStats = {};
        
        Object.keys(fStats).forEach(key => {
            if (typeof fStats[key] === 'number') {
                // Stats also slightly lean towards father (60/40 split)
                const weightedAvg = (fStats[key] * 0.6) + (mStats[key] * 0.4);
                childStats[key] = Math.floor(weightedAvg * 1.05); 
            }
        });

        // 4. RACE & NAME
        const race = Math.random() < 0.5 ? father.race : mother.race;
        const raceData = unitNames.races[race];
        const fName = raceData.first_names[Math.floor(Math.random() * raceData.first_names.length)];
        const lName = father.name.split(' ').pop(); 
        const fullName = `${fName} ${lName}`;

        return {
            name: fullName,
            gender: gender,
            race: race,
            baseStats: childStats,
            naturalTraits: finalTraits,
            fatherId: father.id,
            motherId: mother.id,
            generation: Math.max(father.generation, mother.generation) + 1
        };
    }
}

module.exports = new BreedingManager();