const prisma = require('../src/db');
const logger = require('../src/utils/logger');

/**
 * Seed all material ItemTemplates from MATERIAL_DATA_REFERENCE.md v2.0.
 * Uses findFirst + update/create pattern for idempotent seeding.
 * @returns {Promise<void>}
 */
async function seedMaterials() {
    logger.info('[seedMaterials] Starting material seeding...');

    const materials = [
        // === ORE (1xxx) ===
        { name: 'Copper Ore', description: 'A soft, reddish metal ore commonly found near the surface.', rarity: 'COMMON', baseValue: 5, maxStack: 999 },
        { name: 'Iron Ore', description: 'A sturdy metal ore used for basic weaponry and armor.', rarity: 'COMMON', baseValue: 10, maxStack: 999 },
        { name: 'Silver Ore', description: 'A lustrous ore prized for its beauty and magical conductivity.', rarity: 'UNCOMMON', baseValue: 25, maxStack: 999 },
        { name: 'Gold Ore', description: 'A precious ore valued for luxury accessories and trade.', rarity: 'RARE', baseValue: 80, maxStack: 999 },
        { name: 'Mithril Ore', description: 'A rare, lightweight metal with exceptional strength.', rarity: 'RARE', baseValue: 200, maxStack: 999 },
        { name: 'Adamantite Ore', description: 'An incredibly dense ore found deep underground.', rarity: 'EPIC', baseValue: 500, maxStack: 999 },
        { name: 'Ether Ore', description: 'A crystalline ore infused with pure magical energy.', rarity: 'LEGENDARY', baseValue: 1500, maxStack: 999 },
        { name: 'Titanium Ore', description: 'An ultra-hard metal used for heavy armor reinforcement.', rarity: 'EPIC', baseValue: 600, maxStack: 999 },
        { name: 'Orichalcum', description: 'A mythical golden-red metal of legendary hardness.', rarity: 'LEGENDARY', baseValue: 2000, maxStack: 999 },
        { name: 'Mythril', description: 'The purest form of magical metal, light as air yet unbreakable.', rarity: 'LEGENDARY', baseValue: 2500, maxStack: 999 },
        { name: 'Primordial Ore', description: 'Ore from the dawn of creation, radiating primeval power.', rarity: 'LEGENDARY', baseValue: 5000, maxStack: 999 },

        // === WOOD (2xxx) ===
        { name: 'Oak Wood', description: 'Common hardwood, sturdy and reliable for basic crafting.', rarity: 'COMMON', baseValue: 5, maxStack: 999 },
        { name: 'Yew Wood', description: 'Flexible wood ideal for bows and staves.', rarity: 'UNCOMMON', baseValue: 20, maxStack: 999 },
        { name: 'Ironwood', description: 'Wood as hard as iron, excellent for shields and heavy weapons.', rarity: 'RARE', baseValue: 80, maxStack: 999 },
        { name: 'Spirit Wood', description: 'Wood from an ancient tree imbued with nature spirits.', rarity: 'RARE', baseValue: 200, maxStack: 999 },
        { name: 'Ether Wood', description: 'Wood crystallized by ether energy, glowing faintly blue.', rarity: 'EPIC', baseValue: 500, maxStack: 999 },
        { name: 'World-Tree Branch', description: 'A branch from the legendary World Tree. Immensely powerful.', rarity: 'LEGENDARY', baseValue: 2000, maxStack: 999 },
        { name: 'Moon Wood', description: 'Silver-hued wood that absorbs moonlight. Perfect for magic bows.', rarity: 'RARE', baseValue: 250, maxStack: 999 },
        { name: 'Sun Wood', description: 'Golden wood that radiates warmth. Used for light-aligned weapons.', rarity: 'RARE', baseValue: 250, maxStack: 999 },
        { name: 'Shadow Wood', description: 'Dark wood from the Abyss. Absorbs light around it.', rarity: 'EPIC', baseValue: 600, maxStack: 999 },
        { name: 'Primordial Wood', description: 'Wood from the first tree ever grown, pulsing with creation energy.', rarity: 'LEGENDARY', baseValue: 5000, maxStack: 999 },

        // === CLOTH (3xxx) ===
        { name: 'Cloth', description: 'Simple woven fabric for basic clothing and light armor.', rarity: 'COMMON', baseValue: 3, maxStack: 999 },
        { name: 'Cotton', description: 'Soft natural fiber, comfortable and easy to work with.', rarity: 'COMMON', baseValue: 5, maxStack: 999 },
        { name: 'Silk', description: 'Fine fabric with a lustrous sheen. Excellent for mage robes.', rarity: 'UNCOMMON', baseValue: 25, maxStack: 999 },
        { name: 'Wool', description: 'Warm natural fiber from mountain sheep.', rarity: 'COMMON', baseValue: 5, maxStack: 999 },
        { name: 'Mystic Cloth', description: 'Cloth woven with enchanted threads that shimmer in darkness.', rarity: 'RARE', baseValue: 100, maxStack: 999 },
        { name: 'Dragon Silk', description: 'Incredibly tough silk harvested from dragon cocoons.', rarity: 'EPIC', baseValue: 500, maxStack: 999 },
        { name: 'Ether Cloth', description: 'Fabric woven from solidified ether. Weightless yet resilient.', rarity: 'LEGENDARY', baseValue: 1500, maxStack: 999 },
        { name: 'Shadow Silk', description: 'Silk spun from darkness itself. Nearly invisible in dim light.', rarity: 'LEGENDARY', baseValue: 2000, maxStack: 999 },
        { name: 'Holy Cloth', description: 'Blessed fabric that glows with divine radiance.', rarity: 'LEGENDARY', baseValue: 2000, maxStack: 999 },
        { name: 'Primordial Cloth', description: 'Fabric from the dawn of creation, impervious to all elements.', rarity: 'LEGENDARY', baseValue: 5000, maxStack: 999 },

        // === LEATHER (4xxx) ===
        { name: 'Leather', description: 'Basic tanned animal hide for light armor.', rarity: 'COMMON', baseValue: 5, maxStack: 999 },
        { name: 'Wolf Pelt', description: 'Thick fur pelt from a dire wolf. Warm and durable.', rarity: 'UNCOMMON', baseValue: 20, maxStack: 999 },
        { name: 'Bear Hide', description: 'Heavy hide from a cave bear. Excellent natural protection.', rarity: 'RARE', baseValue: 80, maxStack: 999 },
        { name: 'Serpent Scale', description: 'Iridescent scales from a giant serpent. Surprisingly flexible.', rarity: 'RARE', baseValue: 200, maxStack: 999 },
        { name: 'Dragon Scale', description: 'Nearly indestructible scales shed by an ancient dragon.', rarity: 'EPIC', baseValue: 600, maxStack: 999 },
        { name: 'Giant Hide', description: 'Massive hide from a fallen giant. Extremely thick.', rarity: 'EPIC', baseValue: 500, maxStack: 999 },
        { name: 'Ether Leather', description: 'Leather infused with ether energy. Lightweight and enchantable.', rarity: 'LEGENDARY', baseValue: 1500, maxStack: 999 },
        { name: 'Primordial Hide', description: 'Hide from a primordial beast. Immune to elemental damage.', rarity: 'LEGENDARY', baseValue: 5000, maxStack: 999 },
        { name: 'Shadow Leather', description: 'Leather cured in abyssal darkness. Absorbs incoming shadow.', rarity: 'LEGENDARY', baseValue: 2000, maxStack: 999 },
        { name: 'Demon Hide', description: 'Scalding hide stripped from a slain demon lord.', rarity: 'LEGENDARY', baseValue: 2500, maxStack: 999 },

        // === HERB (5xxx) ===
        { name: 'Silverleaf', description: 'A common herb with mild healing properties.', rarity: 'COMMON', baseValue: 3, maxStack: 999 },
        { name: 'Bloodroot', description: 'A red-stemmed herb that accelerates blood clotting.', rarity: 'COMMON', baseValue: 5, maxStack: 999 },
        { name: 'Moonwort', description: 'A blue herb that blooms only under moonlight. Restores mana.', rarity: 'UNCOMMON', baseValue: 20, maxStack: 999 },
        { name: 'Sunflower', description: 'A radiant flower containing concentrated vitality.', rarity: 'UNCOMMON', baseValue: 20, maxStack: 999 },
        { name: 'Wolfsbane', description: 'A potent herb that amplifies physical strength temporarily.', rarity: 'RARE', baseValue: 80, maxStack: 999 },
        { name: 'Mana Root', description: 'A deep-growing root saturated with magical energy.', rarity: 'RARE', baseValue: 100, maxStack: 999 },
        { name: 'Ghost Root', description: 'A translucent root found in haunted grounds.', rarity: 'RARE', baseValue: 150, maxStack: 999 },
        { name: 'Dragon Heart', description: 'Not an actual heart, but a red herb shaped like one. Extremely potent.', rarity: 'EPIC', baseValue: 500, maxStack: 999 },
        { name: 'Dark Thorn', description: 'A thorny vine from the shadow realm. Potent in dark alchemy.', rarity: 'EPIC', baseValue: 600, maxStack: 999 },
        { name: 'Sacred Lotus', description: 'A legendary flower said to bloom once per century.', rarity: 'LEGENDARY', baseValue: 2000, maxStack: 999 },
        { name: 'Primordial Herb', description: 'An herb from before recorded history. Contains creation essence.', rarity: 'LEGENDARY', baseValue: 5000, maxStack: 999 },

        // === ESSENCE (6xxx) ===
        { name: 'Mana Essence', description: 'Crystallized mana energy. A basic enchanting reagent.', rarity: 'COMMON', baseValue: 10, maxStack: 999 },
        { name: 'Arcane Essence', description: 'Concentrated arcane power. Used for magic weapon crafting.', rarity: 'UNCOMMON', baseValue: 30, maxStack: 999 },
        { name: 'Elemental Essence', description: 'Unstable essence containing mixed elemental energy.', rarity: 'RARE', baseValue: 100, maxStack: 999 },
        { name: 'Fire Essence', description: 'A blazing core of pure fire energy.', rarity: 'RARE', baseValue: 150, maxStack: 999 },
        { name: 'Water Essence', description: 'A flowing orb of pure water energy.', rarity: 'RARE', baseValue: 150, maxStack: 999 },
        { name: 'Earth Essence', description: 'A dense crystal of pure earth energy.', rarity: 'RARE', baseValue: 150, maxStack: 999 },
        { name: 'Wind Essence', description: 'A swirling vortex of pure wind energy.', rarity: 'RARE', baseValue: 150, maxStack: 999 },
        { name: 'Light Essence', description: 'A radiant sphere of pure light energy.', rarity: 'EPIC', baseValue: 400, maxStack: 999 },
        { name: 'Dark Essence', description: 'A shadowy orb of pure dark energy.', rarity: 'EPIC', baseValue: 400, maxStack: 999 },
        { name: 'Blood Essence', description: 'Potent essence extracted from powerful creatures.', rarity: 'EPIC', baseValue: 500, maxStack: 999 },
        { name: 'Soul Fragment', description: 'A fragment of a departed soul. Pulses with lingering will.', rarity: 'LEGENDARY', baseValue: 2000, maxStack: 999 },
        { name: 'Primordial Essence', description: 'The purest essence from the birth of the world.', rarity: 'LEGENDARY', baseValue: 5000, maxStack: 999 },

        // === FRAGMENT (8xxx) ===
        { name: 'Ancient Fragment', description: 'A piece of an ancient artifact. Hums with residual power.', rarity: 'RARE', baseValue: 100, maxStack: 999 },
        { name: 'Boss Relic', description: 'A relic dropped by a defeated boss. Key crafting component.', rarity: 'RARE', baseValue: 150, maxStack: 999 },
        { name: 'Heroic Fragment', description: 'A shard imbued with heroic deeds. Resonates with courage.', rarity: 'EPIC', baseValue: 400, maxStack: 999 },
        { name: 'Legendary Part', description: 'A component from a legendary creature or weapon.', rarity: 'EPIC', baseValue: 600, maxStack: 999 },
        { name: 'Dark Shard', description: 'A shard of condensed darkness from a rift.', rarity: 'LEGENDARY', baseValue: 2000, maxStack: 999 },
        { name: 'Sacred Fragment', description: 'A blessed fragment radiating holy energy.', rarity: 'LEGENDARY', baseValue: 2000, maxStack: 999 },
        { name: 'Chaos Fragment', description: 'An unstable fragment born from pure chaos.', rarity: 'LEGENDARY', baseValue: 2500, maxStack: 999 },
        { name: 'Creation Fragment', description: 'A fragment from the moment of creation itself.', rarity: 'LEGENDARY', baseValue: 5000, maxStack: 999 },
        { name: 'Destruction Fragment', description: 'A fragment containing the power to unmake.', rarity: 'LEGENDARY', baseValue: 5000, maxStack: 999 },
        { name: 'Eternal Fragment', description: 'A fragment outside of time. Neither decays nor ages.', rarity: 'LEGENDARY', baseValue: 5000, maxStack: 999 },

        // === DUST (9xxx) ===
        { name: 'Iron Dust', description: 'Fine iron powder used for basic enchanting.', rarity: 'COMMON', baseValue: 3, maxStack: 999 },
        { name: 'Steel Dust', description: 'Refined steel powder for advanced enchanting.', rarity: 'UNCOMMON', baseValue: 15, maxStack: 999 },
        { name: 'Magic Dust', description: 'Sparkling dust containing traces of magic.', rarity: 'COMMON', baseValue: 5, maxStack: 999 },
        { name: 'Enchanting Dust', description: 'Specially prepared dust for precision enchanting.', rarity: 'UNCOMMON', baseValue: 20, maxStack: 999 },
        { name: 'Gem Dust', description: 'Pulverized gemstone used for socket preparation.', rarity: 'UNCOMMON', baseValue: 25, maxStack: 999 },
        { name: 'Mystic Dust', description: 'Dust imbued with concentrated arcane energy.', rarity: 'RARE', baseValue: 100, maxStack: 999 },
        { name: 'Shadow Dust', description: 'Fine particles of condensed shadow energy.', rarity: 'EPIC', baseValue: 400, maxStack: 999 },
        { name: 'Sacred Dust', description: 'Blessed dust that purifies and empowers enchantments.', rarity: 'EPIC', baseValue: 400, maxStack: 999 },
        { name: 'Primordial Dust', description: 'Dust from before the world was formed.', rarity: 'LEGENDARY', baseValue: 5000, maxStack: 999 },

        // === BONE (10xxx) ===
        { name: 'Bone', description: 'Common bone from fallen beasts. Basic crafting material.', rarity: 'COMMON', baseValue: 3, maxStack: 999 },
        { name: 'Skeleton Bone', description: 'Bone from an animated skeleton. Still hums with dark energy.', rarity: 'UNCOMMON', baseValue: 15, maxStack: 999 },
        { name: 'Orc Bone', description: 'Dense bone from a slain orc warrior.', rarity: 'RARE', baseValue: 50, maxStack: 999 },
        { name: 'Giant Bone', description: 'Massive bone from a fallen giant. Remarkably heavy.', rarity: 'RARE', baseValue: 100, maxStack: 999 },
        { name: 'Dragon Bone', description: 'Bone from an ancient dragon. Nearly unbreakable.', rarity: 'EPIC', baseValue: 600, maxStack: 999 },
        { name: 'Demon Bone', description: 'Charred bone from a slain demon. Radiates infernal heat.', rarity: 'LEGENDARY', baseValue: 2000, maxStack: 999 },
        { name: 'Primordial Bone', description: 'Bone from the first creatures. Fossilized with primeval power.', rarity: 'LEGENDARY', baseValue: 5000, maxStack: 999 },

        // === FOOD (11xxx) ===
        { name: 'Raw Meat', description: 'Fresh meat from a slain beast. Needs cooking.', rarity: 'COMMON', baseValue: 2, maxStack: 999 },
        { name: 'Raw Fish', description: 'A freshly caught fish. Best served cooked.', rarity: 'COMMON', baseValue: 2, maxStack: 999 },
        { name: 'Vegetables', description: 'Assorted fresh vegetables from a nearby farm.', rarity: 'COMMON', baseValue: 2, maxStack: 999 },
        { name: 'Grain', description: 'Golden grain harvested from fertile fields.', rarity: 'COMMON', baseValue: 2, maxStack: 999 },
        { name: 'Fruit', description: 'Ripe fruit picked from an orchard.', rarity: 'COMMON', baseValue: 2, maxStack: 999 },
        { name: 'Spices', description: 'Exotic spices that enhance any dish.', rarity: 'UNCOMMON', baseValue: 15, maxStack: 999 },
        { name: 'Rare Herb', description: 'A hard-to-find herb used in gourmet cooking.', rarity: 'RARE', baseValue: 80, maxStack: 999 },
        { name: 'Exotic Fruit', description: 'A tropical fruit with extraordinary flavor and vitality.', rarity: 'RARE', baseValue: 100, maxStack: 999 },
        { name: 'Mythical Meat', description: 'Meat from a mythical beast. Grants vigor when consumed.', rarity: 'EPIC', baseValue: 500, maxStack: 999 },
        { name: 'Dragon Meat', description: 'Meat from a slain dragon. Searing hot and incredibly nourishing.', rarity: 'LEGENDARY', baseValue: 2000, maxStack: 999 },

        // === OTHER (12xxx) ===
        { name: 'Rope', description: 'Basic rope woven from natural fibers.', rarity: 'COMMON', baseValue: 2, maxStack: 999 },
        { name: 'Thread', description: 'Fine thread for sewing and basic crafting.', rarity: 'COMMON', baseValue: 2, maxStack: 999 },
        { name: 'Leather Strip', description: 'A thin strip of leather used as binding material.', rarity: 'COMMON', baseValue: 3, maxStack: 999 },
        { name: 'Metal Bar', description: 'A refined metal bar ready for smithing.', rarity: 'UNCOMMON', baseValue: 20, maxStack: 999 },
        { name: 'Crystal Shard', description: 'A small shard of natural crystal. Conducts magic.', rarity: 'UNCOMMON', baseValue: 25, maxStack: 999 },
        { name: 'Enchanted Log', description: 'A log infused with ambient magic from an ancient forest.', rarity: 'UNCOMMON', baseValue: 25, maxStack: 999 },
        { name: 'Phoenix Feather', description: 'A feather from a reborn phoenix. Burns eternally.', rarity: 'LEGENDARY', baseValue: 3000, maxStack: 999 },
        { name: 'Unicorn Horn', description: 'A horn from a sacred unicorn. Purifies all it touches.', rarity: 'LEGENDARY', baseValue: 3000, maxStack: 999 },
    ];

    let created = 0;
    let updated = 0;

    for (const m of materials) {
        const existing = await prisma.itemTemplate.findFirst({
            where: { name: m.name, category: 'MATERIAL' }
        });

        if (existing) {
            await prisma.itemTemplate.update({
                where: { id: existing.id },
                data: {
                    description: m.description,
                    rarity: m.rarity,
                    baseValue: m.baseValue,
                    maxStack: m.maxStack
                }
            });
            updated++;
        } else {
            await prisma.itemTemplate.create({
                data: {
                    name: m.name,
                    description: m.description,
                    category: 'MATERIAL',
                    rarity: m.rarity,
                    baseValue: m.baseValue,
                    maxStack: m.maxStack
                }
            });
            created++;
        }
    }

    logger.info(`[seedMaterials] Completed: ${created} created, ${updated} updated, ${materials.length} total`);
}

if (require.main === module) {
    seedMaterials()
        .then(() => logger.info('[seedMaterials] ✅ Materials seeded successfully.'))
        .catch(e => logger.error('[seedMaterials] ❌ Material seeding failed:', e))
        .finally(() => prisma.$disconnect());
}

module.exports = seedMaterials;
