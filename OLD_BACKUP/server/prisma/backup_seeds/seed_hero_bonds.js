/**
 * Hero Bond System Seed Script
 * Seeds predefined bond templates into the database
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

const bondTemplates = [
    // === CLASS BONDS ===
    {
        bondType: 'CLASS',
        name: 'Holy Trinity',
        description: 'Warrior + Mage + Healer - The classic party synergy',
        requirement: JSON.stringify({ classes: ['WARRIOR', 'MAGE', 'HEALER'], matchCount: 3 }),
        bonuses: JSON.stringify({ attack_damage: 0.10, defense: 0.10, skill_power: 0.10 }),
        isActive: true
    },
    {
        bondType: 'CLASS',
        name: 'Trinity Force',
        description: '3x Warriors - Pure offensive power',
        requirement: JSON.stringify({ classes: ['WARRIOR'], matchCount: 3 }),
        bonuses: JSON.stringify({ attack_damage: 0.15, defense: 0.10 }),
        isActive: true
    },
    {
        bondType: 'CLASS',
        name: 'Arcane Ascension',
        description: '3x Mages - Ultimate magical destruction',
        requirement: JSON.stringify({ classes: ['MAGE', 'WIZARD'], matchCount: 3 }),
        bonuses: JSON.stringify({ skill_power: 0.20, mana_max: 0.10 }),
        isActive: true
    },
    {
        bondType: 'CLASS',
        name: 'Pack Hunters',
        description: '3x Rogues - Deadly precision',
        requirement: JSON.stringify({ classes: ['ROGUE'], matchCount: 3 }),
        bonuses: JSON.stringify({ dodge_chance: 0.25, crit_chance: 0.10 }),
        isActive: true
    },
    {
        bondType: 'CLASS',
        name: 'Balanced Party',
        description: 'Tank + DPS + Support - Versatile composition',
        requirement: JSON.stringify({ classes: ['WARRIOR', 'ROGUE', 'CLERIC'], matchCount: 3 }),
        bonuses: JSON.stringify({ health_max: 0.10, attack_damage: 0.10, hp_regen: 0.10 }),
        isActive: true
    },
    {
        bondType: 'CLASS',
        name: 'Dual Force',
        description: 'Any 2-hero class combo - Foundation of power',
        requirement: JSON.stringify({ classes: ['WARRIOR', 'MAGE', 'ROGUE', 'CLERIC', 'WIZARD'], matchCount: 2 }),
        bonuses: JSON.stringify({ attack_damage: 0.05, defense: 0.05 }),
        isActive: true
    },

    // === RACE BONDS ===
    {
        bondType: 'RACE',
        name: 'Undead Legion',
        description: '2x Undead (SKELETON, ZOMBIE, VAMPIRE) - Numbers rise again',
        requirement: JSON.stringify({ race: 'SKELETON', count: 2 }),
        bonuses: JSON.stringify({ health_max: 0.15, defense: 0.10 }),
        isActive: true
    },
    {
        bondType: 'RACE',
        name: 'Vampire Blood',
        description: '2x Vampires - Thirst for life',
        requirement: JSON.stringify({ race: 'VAMPIRE', count: 2 }),
        bonuses: JSON.stringify({ lifesteal_base: 0.20, attack_damage: 0.10 }),
        isActive: true
    },
    {
        bondType: 'RACE',
        name: 'Dragonkin Fury',
        description: '2x Dragonkin - Ancient power awakens',
        requirement: JSON.stringify({ race: 'DRAGON', count: 2 }),
        bonuses: JSON.stringify({ fire_damage: 30, attack_damage: 0.15 }),
        isActive: true
    },
    {
        bondType: 'RACE',
        name: 'Beast Pack',
        description: '2x Beasts - Strength in numbers',
        requirement: JSON.stringify({ race: 'BEAST', count: 2 }),
        bonuses: JSON.stringify({ attack_damage: 0.10, speed: 5 }),
        isActive: true
    },

    // === ELEMENTAL BONDS ===
    {
        bondType: 'ELEMENTAL',
        name: 'Fire Covenant',
        description: '2x Fire element heroes - Burns brighter together',
        requirement: JSON.stringify({ element: 'FIRE', matchCount: 2 }),
        bonuses: JSON.stringify({ fire_damage: 20, attack_damage: 0.10 }),
        isActive: true
    },
    {
        bondType: 'ELEMENTAL',
        name: 'Water Unity',
        description: '2x Water element heroes - Flow as one',
        requirement: JSON.stringify({ element: 'WATER', matchCount: 2 }),
        bonuses: JSON.stringify({ mana_max: 50, hp_regen: 0.15 }),
        isActive: true
    },
    {
        bondType: 'ELEMENTAL',
        name: 'Earth Stability',
        description: '2x Earth element heroes - Unmovable force',
        requirement: JSON.stringify({ element: 'EARTH', matchCount: 2 }),
        bonuses: JSON.stringify({ defense: 15, health_max: 0.10 }),
        isActive: true
    },
    {
        bondType: 'ELEMENTAL',
        name: 'Wind Swiftness',
        description: '2x Wind element heroes - Strike with the gale',
        requirement: JSON.stringify({ element: 'WIND', matchCount: 2 }),
        bonuses: JSON.stringify({ speed: 10, dodge_chance: 0.10 }),
        isActive: true
    },
    {
        bondType: 'ELEMENTAL',
        name: 'Light Radiance',
        description: '2x Light element heroes - Banish darkness',
        requirement: JSON.stringify({ element: 'LIGHT', matchCount: 2 }),
        bonuses: JSON.stringify({ light_damage: 20, hp_regen: 0.20 }),
        isActive: true
    },
    {
        bondType: 'ELEMENTAL',
        name: 'Dark Dominion',
        description: '2x Dark element heroes - Embrace the void',
        requirement: JSON.stringify({ element: 'DARK', matchCount: 2 }),
        bonuses: JSON.stringify({ dark_damage: 20, crit_chance: 0.10 }),
        isActive: true
    }
];

async function main() {
    console.log('🌟 Seeding Hero Bond templates...');

    for (const bond of bondTemplates) {
        await prisma.heroBond.upsert({
            where: { name: bond.name },
            update: bond,
            create: bond
        });
        console.log(`  ✅ Created bond: ${bond.name}`);
    }

    console.log(`\n✨ Successfully seeded ${bondTemplates.length} hero bond templates!`);
}

main()
    .catch((e) => {
        console.error('Error seeding hero bonds:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
