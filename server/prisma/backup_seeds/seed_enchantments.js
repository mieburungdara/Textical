/**
 * Enchantment System Seed Script
 * Seeds the database with enchantment templates
 * 
 * Enchantment categories:
 * - ATTACK: Sharpness (+ATK), Berserker (+% ATK when HP < 50%)
 * - DEFENSE: Fortification (+DEF), Stone Skin (+% damage reduction)
 * - ELEMENTAL: Flame (+Fire damage), Frost (+Ice damage)
 * - SPECIAL: Lucky (+% drop rate), Soul Bind (prevents item loss)
 * 
 * Balance:
 * - Max level: 10
 * - Each level: +2 flat stat, +1% percentage
 * - Success rate: 90% at Lv1, 30% at Lv10
 * - Cost: 100,000 silver × level
 */

const prisma = require('../src/db');

async function main() {
    console.log('Seeding enchantments...');

    // Check if enchantments already exist
    const existingCount = await prisma.itemEnchantment.count();
    if (existingCount > 0) {
        console.log(`Enchantments already exist (${existingCount}), skipping seed.`);
        return;
    }

    // ATTACK Enchantments
    const sharpness = await prisma.itemEnchantment.create({
        data: {
            name: 'Sharpness',
            category: 'ATTACK',
            description: 'Increases weapon attack power. +2 ATK per level, +1% ATK per level.',
            statKey: 'attack_damage',
            statValuePerLevel: 2,
            percentBonusPerLevel: 0.01,
            isPercent: false,
            materialId: null,
            materialCount: 5,
            maxLevel: 10,
            baseSuccessRate: 0.9
        }
    });
    console.log(`Created: ${sharpness.name}`);

    const berserker = await prisma.itemEnchantment.create({
        data: {
            name: 'Berserker',
            category: 'ATTACK',
            description: 'Increases attack when HP is below 50%. +1% damage per level when low HP.',
            statKey: 'attack_damage_low_hp',
            statValuePerLevel: 0,
            percentBonusPerLevel: 0.01,
            isPercent: false,
            condition: JSON.stringify({ stat: 'hp_percent', operator: 'less_than', value: 50 }),
            materialId: null,
            materialCount: 3,
            maxLevel: 10,
            baseSuccessRate: 0.9
        }
    });
    console.log(`Created: ${berserker.name}`);

    // DEFENSE Enchantments
    const fortification = await prisma.itemEnchantment.create({
        data: {
            name: 'Fortification',
            category: 'DEFENSE',
            description: 'Increases defense. +2 DEF per level, +1% DEF per level.',
            statKey: 'defense',
            statValuePerLevel: 2,
            percentBonusPerLevel: 0.01,
            isPercent: false,
            materialId: null,
            materialCount: 5,
            maxLevel: 10,
            baseSuccessRate: 0.9
        }
    });
    console.log(`Created: ${fortification.name}`);

    const stoneSkin = await prisma.itemEnchantment.create({
        data: {
            name: 'Stone Skin',
            category: 'DEFENSE',
            description: 'Reduces incoming damage. +1% damage reduction per level.',
            statKey: 'damage_reduction',
            statValuePerLevel: 0,
            percentBonusPerLevel: 0.01,
            isPercent: false,
            materialId: null,
            materialCount: 3,
            maxLevel: 10,
            baseSuccessRate: 0.9
        }
    });
    console.log(`Created: ${stoneSkin.name}`);

    // ELEMENTAL Enchantments
    const flame = await prisma.itemEnchantment.create({
        data: {
            name: 'Flame',
            category: 'ELEMENTAL',
            description: 'Adds fire damage to weapon. +2 Fire damage per level, +1% Fire damage per level.',
            statKey: 'fire_damage',
            statValuePerLevel: 2,
            percentBonusPerLevel: 0.01,
            isPercent: false,
            materialId: null,
            materialCount: 5,
            maxLevel: 10,
            baseSuccessRate: 0.9
        }
    });
    console.log(`Created: ${flame.name}`);

    const frost = await prisma.itemEnchantment.create({
        data: {
            name: 'Frost',
            category: 'ELEMENTAL',
            description: 'Adds ice damage to weapon. +2 Ice damage per level, +1% Ice damage per level.',
            statKey: 'water_damage',
            statValuePerLevel: 2,
            percentBonusPerLevel: 0.01,
            isPercent: false,
            materialId: null,
            materialCount: 5,
            maxLevel: 10,
            baseSuccessRate: 0.9
        }
    });
    console.log(`Created: ${frost.name}`);

    // SPECIAL Enchantments
    const lucky = await prisma.itemEnchantment.create({
        data: {
            name: 'Lucky',
            category: 'SPECIAL',
            description: 'Increases item drop rate. +1% drop rate per level.',
            statKey: 'drop_rate',
            statValuePerLevel: 0,
            percentBonusPerLevel: 0.01,
            isPercent: false,
            materialId: null,
            materialCount: 3,
            maxLevel: 10,
            baseSuccessRate: 0.9
        }
    });
    console.log(`Created: ${lucky.name}`);

    const soulBind = await prisma.itemEnchantment.create({
        data: {
            name: 'Soul Bind',
            category: 'SPECIAL',
            description: 'Prevents item loss on death. At max level, item is protected.',
            statKey: 'soul_bound',
            statValuePerLevel: 0,
            percentBonusPerLevel: 0,
            isPercent: false,
            materialId: null,
            materialCount: 1,
            maxLevel: 1,
            baseSuccessRate: 0.5
        }
    });
    console.log(`Created: ${soulBind.name}`);

    console.log('');
    console.log('Enchantment seeding complete!');
    console.log('');
    console.log('Summary:');
    console.log('- ATTACK: Sharpness, Berserker');
    console.log('- DEFENSE: Fortification, Stone Skin');
    console.log('- ELEMENTAL: Flame, Frost');
    console.log('- SPECIAL: Lucky, Soul Bind');
    console.log('');
    console.log('Balance:');
    console.log('- Max Level: 10 (except Soul Bind = 1)');
    console.log('- Per Level: +2 flat stat, +1% bonus');
    console.log('- Success: 90% → 30% (decreases 7% per level)');
    console.log('- Cost: 100,000 silver × level');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Error seeding enchantments:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
