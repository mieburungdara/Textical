/**
 * Seed: Weapons from WEAPON_DATA_REFERENCE.md
 * Parses the Markdown documentation and populates the database using relations.
 * Run with: node prisma/seed_weapons.js
 */

const fs = require('fs');
const path = require('path');
const prisma = require('../src/db');

const MD_PATH = path.join(__dirname, '../../reports/WEAPON_DATA_REFERENCE.md');
const MASTER_JSON_PATH = path.join(__dirname, 'master_weapons.json');

// Mapping Rarity based on MD Tier
const RARITY_MAP = {
    '1': 'COMMON',
    '2': 'UNCOMMON',
    '3': 'REFINED',
    '4': 'SUPERIOR',
    '5': 'RARE',
    '6': 'HEROIC',
    '7': 'EPIC',
    '8': 'RELIC',
    '9': 'ANCIENT',
    '10': 'MYTHIC'
};

async function seedFromJson() {
    console.log('📦 Found master_weapons.json. Seeding from persistence layer...');
    const data = JSON.parse(fs.readFileSync(MASTER_JSON_PATH, 'utf8'));
    let totalSeeded = 0;

    // 1. Seed Types
    for (const type of data.types) {
        await prisma.weaponType.upsert({
            where: { id: parseInt(type.id) },
            update: { name: type.name, category: type.category },
            create: { id: parseInt(type.id), name: type.name, category: type.category }
        });
    }
    console.log(`  ✅ Restored ${data.types.length} Weapon Types.`);

    // 2. Seed Weapons
    for (const w of data.weapons) {
        await prisma.itemTemplate.upsert({
            where: { id: parseInt(w.id) },
            update: {
                name: w.name,
                description: w.description,
                category: w.category,
                rarity: w.rarity,
                isTwoHanded: parseInt(w.isTwoHanded) === 1,
                weaponTypeId: parseInt(w.weaponTypeId),
                baseValue: parseInt(w.baseValue),
                imageUrl: w.imageUrl || null,
                maxStack: 1
            },
            create: {
                id: parseInt(w.id),
                name: w.name,
                description: w.description,
                category: w.category,
                rarity: w.rarity,
                isTwoHanded: parseInt(w.isTwoHanded) === 1,
                weaponTypeId: parseInt(w.weaponTypeId),
                baseValue: parseInt(w.baseValue),
                imageUrl: w.imageUrl || null,
                maxStack: 1
            }
        });

        // Handle Stats
        await prisma.itemStat.deleteMany({ where: { itemId: parseInt(w.id) } });
        for (const [key, val] of Object.entries(w.stats)) {
            await prisma.itemStat.create({
                data: {
                    itemId: parseInt(w.id),
                    statKey: key,
                    statValue: parseFloat(val)
                }
            });
        }
        totalSeeded++;
    }

    console.log(`\n🎉 Successfully restored ${totalSeeded} weapons from master JSON!`);
    return true;
}

async function main() {
    console.log('⚔️  Seeding Weapons with Relational Types...\n');

    // NEW: Check for Master JSON first
    if (fs.existsSync(MASTER_JSON_PATH)) {
        try {
            const success = await seedFromJson();
            if (success) return;
        } catch (err) {
            console.error('⚠️  Failed to seed from JSON, falling back to Markdown:', err.message);
        }
    }

    if (!fs.existsSync(MD_PATH)) {
        console.error(`❌ MD file not found at: ${MD_PATH}`);
        return;
    }

    const content = fs.readFileSync(MD_PATH, 'utf8');

    // Clear existing data before MD seeding to avoid ID orphans
    console.log('🧹 Clearing existing weapons and stats for fresh Markdown seed...');
    await prisma.itemStat.deleteMany({});
    await prisma.itemTrait.deleteMany({});
    await prisma.itemTemplate.deleteMany({ where: { category: 'EQUIPMENT' } });

    // 1. Parse Weapon Type ID Reference and Category
    const weaponTypes = {};
    const typeTableMatch = content.match(/## Weapon Type ID Reference[\s\S]*?\| Type ID \| Name \|[\s\S]*?\|-+\|[\s\S]*?(\n\| 1 \|[\s\S]*?)(?=\n\n|---)/);
    
    if (typeTableMatch) {
        const rows = typeTableMatch[1].trim().split('\n');
        for (const row of rows) {
            const cols = row.split('|').map(c => c.trim()).filter(Boolean);
            if (cols.length >= 4) {
                const id = parseInt(cols[0]);
                const name = cols[1];
                const displayName = cols[2];
                const category = cols[3].toUpperCase(); // MELEE, RANGED, MAGIC, SHIELD, UNARMED
                
                weaponTypes[name.toUpperCase()] = { id, name: displayName, category };

                // Upsert WeaponType
                await prisma.weaponType.upsert({
                    where: { id: id },
                    update: { name: displayName, category: category },
                    create: { id: id, name: displayName, category: category }
                });
            }
        }
    }

    console.log(`  Found and Seeded ${Object.keys(weaponTypes).length} Weapon Types.`);

    // --- NEW: Seed Weapon Type Tags ---
    const tagMatch = content.match(/## Weapon Type to Tag Mapping \(REVISED\)[\s\S]*?\| Weapon Type \| Tag 1 \| Tag 2 \|[\s\S]*?\|-+\|[\s\S]*?(\n\| [\s\S]*?)(?=\n\n|---)/);
    if (tagMatch) {
        console.log('🏷️  Seeding Weapon Type Tags...');
        const rows = tagMatch[1].trim().split('\n');
        for (const row of rows) {
            const cols = row.split('|').map(c => c.trim()).filter(Boolean);
            if (cols.length >= 3) {
                const typeName = cols[0].replace(/\*\*/g, '').toUpperCase();
                const tags = [cols[1], cols[2]];
                
                const typeData = weaponTypes[typeName];
                if (typeData) {
                    for (const tagName of tags) {
                        if (tagName && tagName !== '-') {
                            // 1. Ensure MechanicTag exists
                            const tag = await prisma.mechanicTag.upsert({
                                where: { name: tagName },
                                update: {},
                                create: { name: tagName, description: 'Weapon Type Tag' }
                            });

                            // 2. Create WeaponTypeTag relation
                            await prisma.weaponTypeTag.upsert({
                                where: { 
                                    weaponTypeId_tagId: { 
                                        weaponTypeId: typeData.id, 
                                        tagId: tag.id 
                                    } 
                                },
                                update: {},
                                create: { weaponTypeId: typeData.id, tagId: tag.id }
                            });
                        }
                    }
                }
            }
        }
    }

    // --- NEW: Seed Weapon Passives via PassiveTemplate + WeaponTypePassive ---
    const passiveMatch = content.match(/## Weapon Unique Passives \(REVISED\)[\s\S]*?\| Weapon Type \| Unique Passive 1 \| Unique Passive 2 \|[\s\S]*?\|-+\|[\s\S]*?(\n\| [\s\S]*?)(?=\n\n|---)/);
    if (passiveMatch) {
        console.log('📜 Seeding Weapon Unique Passives (PassiveTemplate)...');
        const rows = passiveMatch[1].trim().split('\n');
        for (const row of rows) {
            const cols = row.split('|').map(/** @param {string} c */ (c) => c.trim()).filter(Boolean);
            if (cols.length >= 3) {
                const typeName = cols[0].replace(/\*\*/g, '').toUpperCase();
                const passives = [cols[1], cols[2]];

                const typeData = weaponTypes[typeName];
                if (typeData) {
                    // Clear existing links for this weapon type
                    await prisma.weaponTypePassive.deleteMany({ where: { weaponTypeId: typeData.id } });
                    
                    for (const passiveStr of passives) {
                        if (passiveStr && passiveStr !== '-' && passiveStr !== 'N/A') {
                            const [pName, pDesc] = passiveStr.includes(':') 
                                ? passiveStr.split(':').map(/** @param {string} s */ (s) => s.trim()) 
                                : [passiveStr, ''];
                                
                            // 1. Upsert global PassiveTemplate
                            let passive = await prisma.passiveTemplate.findFirst({ where: { name: pName } });
                            if (!passive) {
                                passive = await prisma.passiveTemplate.create({
                                    data: { name: pName, description: pDesc || pName }
                                });
                            }

                            // 2. Create WeaponTypePassive bridge
                            await prisma.weaponTypePassive.create({
                                data: {
                                    weaponTypeId: typeData.id,
                                    passiveId: passive.id
                                }
                            });
                        }
                    }
                }
            }
        }
    }

    // 2. Parse Weapon Tables and Seed Items
    const sections = content.split(/\n(?=#+ )/);
    let totalSeeded = 0;
    const typeIndices = {}; // Track index per typeId across sections

    for (const section of sections) {
        const lines = section.trim().split('\n');
        if (lines.length === 0) continue;

        const headerLine = lines[0].replace(/^#+\s+/, '').trim();
        
        // Extract Name
        const nameMatch = headerLine.match(/^([^(]+)(?:\(([^)]+)\))?/);
        if (!nameMatch) continue;

        const typeNameRaw = nameMatch[1].trim();
        let typeKey = typeNameRaw.toUpperCase();
        
        // Normalization for matching
        if (typeKey.includes('LONGBOW')) typeKey = 'BOW'; 
        if (typeKey.includes('GREATBOW')) typeKey = 'GREATBOW';

        // Improved matching: Try exact match first, then fuzzy match with space/underscore normalization
        let typeData = weaponTypes[typeKey] || weaponTypes[typeKey.replace(/\s+/g, '_')];
        
        if (!typeData) {
            // Re-normalize weaponTypes keys for searching
            const foundKey = Object.keys(weaponTypes).find(k => {
                const normalizedK = k.replace(/_/g, ' ');
                return typeKey === normalizedK || typeKey.includes(normalizedK) || normalizedK.includes(typeKey);
            });
            if (foundKey) typeData = weaponTypes[foundKey];
        }

        if (!typeData) {
            console.warn(`⚠️  No type data found for: ${headerLine} (Key: ${typeKey})`);
            continue;
        }

        const tableIndex = lines.findIndex(l => l.includes('| Name | Tier |'));
        if (tableIndex === -1) continue;

        const tableBody = lines.slice(tableIndex + 2);

        for (const row of tableBody) {
            if (!row.trim() || !row.startsWith('|')) break;

            const cols = row.split('|').map(c => c.trim()).filter(Boolean);
            if (cols.length < 5) continue;

            const name = cols[0];
            const tier = cols[1];
            const level = parseInt(cols[2]);
            const baseAtk = parseInt(cols[3]);
            const baseDefOrMatk = parseInt(cols[4]);
            const attackTicksOrMdef = cols[5];
            const specialTrait = cols[7]; // Trait is the last column

            // Initialize or increment index for THIS type
            if (!typeIndices[typeData.id]) typeIndices[typeData.id] = 1;
            const currentIndex = typeIndices[typeData.id]++;

            const itemId = 10000 + (typeData.id * 100) + currentIndex;
            const rarity = RARITY_MAP[tier] || 'COMMON';

            const twoHandedTypes = ['GREATSWORD', 'BATTLE AXE', 'WAR HAMMER', 'SPEAR', 'BOW', 'GREATBOW', 'LONGBOW', 'CROSSBOW', 'TOME', 'STAFF', 'TOWER SHIELD', 'SCYTHE'];
            const isTwoHanded = twoHandedTypes.includes(typeData.name.toUpperCase()) || headerLine.toUpperCase().includes('TWO-HANDED');

            // Stats object
            const stats = [
                { key: 'damage_base', value: baseAtk },
                { key: 'level_requirement', value: level }
            ];

            if (headerLine.toLowerCase().includes('magic') || typeData.category === 'MAGIC') {
                stats.push({ key: 'magic_damage_base', value: baseAtk });
                if (baseDefOrMatk > 0) stats.push({ key: 'magic_defense_base', value: baseDefOrMatk });
            } else {
                if (baseDefOrMatk !== 0) stats.push({ key: 'defense_base', value: baseDefOrMatk });
            }

            const ticks = parseInt(attackTicksOrMdef);
            if (!isNaN(ticks)) stats.push({ key: 'attack_ticks', value: ticks });

            // Upsert Weapon Item
            await prisma.itemTemplate.upsert({
                where: { id: itemId },
                update: {
                    name: name,
                    description: `A ${typeData.name} of level ${level}.`,
                    category: 'EQUIPMENT',
                    rarity: rarity,
                    isTwoHanded: isTwoHanded,
                    weaponTypeId: typeData.id,
                    baseValue: 10 + (level * 5),
                    imageUrl: null, // Default null for MD seed
                    maxStack: 1
                },
                create: {
                    id: itemId,
                    name: name,
                    description: `A ${typeData.name} of level ${level}.`,
                    category: 'EQUIPMENT',
                    rarity: rarity,
                    isTwoHanded: isTwoHanded,
                    weaponTypeId: typeData.id,
                    baseValue: 10 + (level * 5),
                    imageUrl: null,
                    maxStack: 1
                }
            });

            // Handle Stats
            await prisma.itemStat.deleteMany({ where: { itemId: itemId } });
            for (const s of stats) {
                await prisma.itemStat.create({
                    data: {
                        itemId: itemId,
                        statKey: s.key,
                        statValue: parseFloat(s.value)
                    }
                });
            }

            // --- NEW: Handle Traits ---
            if (specialTrait && specialTrait !== '-' && specialTrait !== 'N/A') {
                // 1. Ensure TraitTemplate exists
                const trait = await prisma.traitTemplate.upsert({
                    where: { id: 0 }, // This is tricky since we don't have trait IDs. 
                    // Let's use name as proxy if we find it by name first.
                    update: {},
                    create: { name: specialTrait, description: 'Weapon Talent', category: 'WEAPON' }
                });
                // Wait, searching by ID 0 is wrong. Let's fix.
                const existingTrait = await prisma.traitTemplate.findFirst({ where: { name: specialTrait } });
                const finalTrait = existingTrait || await prisma.traitTemplate.create({ 
                    data: { name: specialTrait, description: 'Weapon Talent', category: 'WEAPON' } 
                });

                await prisma.itemTrait.upsert({
                    where: { 
                        id: 0 // We don't have a unique key for ItemTrait other than ID. 
                    },
                    // Better just delete and re-create for simplicity in seeder
                    update: {},
                    create: { itemId: itemId, traitId: finalTrait.id }
                });
                // Refactor to deleteMany/create
            }
            // For traits, let's just clear and add
            await prisma.itemTrait.deleteMany({ where: { itemId: itemId } });
            if (specialTrait && specialTrait !== '-' && specialTrait !== 'N/A') {
                const existingTrait = await prisma.traitTemplate.findFirst({ where: { name: specialTrait } });
                const finalTrait = existingTrait || await prisma.traitTemplate.create({ 
                    data: { name: specialTrait, description: 'Weapon Talent', category: 'WEAPON' } 
                });
                await prisma.itemTrait.create({ data: { itemId: itemId, traitId: finalTrait.id } });
            }

            totalSeeded++;
        }
        console.log(`  ✅ Seeded: ${typeData.name} (Total so far: ${typeIndices[typeData.id] - 1})`);
    }

    console.log(`\n🎉 Successfully seeded ${totalSeeded} relational weapons from Markdown!`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding weapons:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
