import assert from 'node:assert';
import test from 'node:test';
import {
  // Material imports
  ORE_MATERIALS,
  WOOD_MATERIALS,
  HIDE_MATERIALS,
  HERB_MATERIALS,
  BONE_MATERIALS,
  ESSENCE_MATERIALS,
  FIBER_MATERIALS,
  
  // Enums
  MaterialCategory,
  MaterialTier,
  MaterialRarity,
  MaterialSource,
  MaterialUse,
  
  // Functions
  getMaterial,
  getAllMaterials,
  getMaterialsByCategory,
  getMaterialsByRarity,
  getMaterialsByTier,
  getMaterialsBySource,
  getMaterialsByUse,
  getMaterialsByMinLevel,
  getMaterialsByPrefix,
  getAllMaterialIds,
  getMaterialCountByCategory,
  getMaterialCountByTier,
  getBasicMaterials,
  getCraftingMaterials,
  getSellableMaterials,
  getMonsterDropMaterials,
  getBossDropMaterials,
  getLegendaryMaterials,
  getEpicMaterials,
  getMaterialRarityColor,
  getRarityMultiplier,
  materialStats,
} from '../dist/src/templates/materials/index.js';

test('Materials - All material categories exist', () => {
  assert.ok(ORE_MATERIALS, 'Ore materials should exist');
  assert.ok(WOOD_MATERIALS, 'Wood materials should exist');
  assert.ok(HIDE_MATERIALS, 'Hide materials should exist');
  assert.ok(HERB_MATERIALS, 'Herb materials should exist');
  assert.ok(BONE_MATERIALS, 'Bone materials should exist');
  assert.ok(ESSENCE_MATERIALS, 'Essence materials should exist');
  assert.ok(FIBER_MATERIALS, 'Fiber materials should exist');
  
  console.log('✓ All material categories exist');
});

test('Materials - Material enums are defined', () => {
  // Category
  assert.equal(MaterialCategory.ORE, 'ore');
  assert.equal(MaterialCategory.WOOD, 'wood');
  assert.equal(MaterialCategory.HIDE, 'hide');
  assert.equal(MaterialCategory.HERB, 'herb');
  assert.equal(MaterialCategory.BONE, 'bone');
  assert.equal(MaterialCategory.ESSENCE, 'essence');
  assert.equal(MaterialCategory.FIBER, 'fiber');
  
  // Tier
  assert.equal(MaterialTier.TIER_1, 1);
  assert.equal(MaterialTier.TIER_2, 2);
  assert.equal(MaterialTier.TIER_3, 3);
  assert.equal(MaterialTier.TIER_4, 4);
  assert.equal(MaterialTier.TIER_5, 5);
  assert.equal(MaterialTier.TIER_6, 6);
  
  // Rarity
  assert.equal(MaterialRarity.COMMON, 'common');
  assert.equal(MaterialRarity.UNCOMMON, 'uncommon');
  assert.equal(MaterialRarity.RARE, 'rare');
  assert.equal(MaterialRarity.EPIC, 'epic');
  assert.equal(MaterialRarity.LEGENDARY, 'legendary');
  
  // Source
  assert.equal(MaterialSource.MINING, 'mining');
  assert.equal(MaterialSource.GATHERING, 'gathering');
  assert.equal(MaterialSource.MOB_DROP, 'mob_drop');
  assert.equal(MaterialSource.BOSS_DROP, 'boss_drop');
  
  // Use
  assert.equal(MaterialUse.CRAFTING, 'crafting');
  assert.equal(MaterialUse.SELLING, 'selling');
  assert.equal(MaterialUse.ENCHANTING, 'enchanting');
  assert.equal(MaterialUse.POTION_INGREDIENT, 'potion_ingredient');
  assert.equal(MaterialUse.FOOD_INGREDIENT, 'food_ingredient');
  
  console.log('✓ Material enums are properly defined');
});

test('Materials - Get material by ID', () => {
  const ironOre = getMaterial('iron_ore');
  assert.ok(ironOre, 'Iron ore should exist');
  assert.equal(ironOre.name, 'Iron Ore');
  assert.equal(ironOre.category, MaterialCategory.ORE);
  assert.equal(ironOre.tier, MaterialTier.TIER_1);
  
  const dragonScale = getMaterial('dragon_scale');
  assert.ok(dragonScale, 'Dragon scale should exist');
  assert.equal(dragonScale.name, 'Dragon Scale');
  assert.equal(dragonScale.category, MaterialCategory.HIDE);
  assert.equal(dragonScale.rarity, MaterialRarity.EPIC);
  
  const notFound = getMaterial('nonexistent_material');
  assert.equal(notFound, undefined, 'Nonexistent material should return undefined');
  
  console.log('✓ Get material by ID works');
});

test('Materials - Get materials by category', () => {
  const ores = getMaterialsByCategory(MaterialCategory.ORE);
  assert.ok(ores.length > 0, 'Should have ore materials');
  assert.ok(ores.every(m => m.category === MaterialCategory.ORE), 'All should be ores');
  
  const woods = getMaterialsByCategory(MaterialCategory.WOOD);
  assert.ok(woods.length > 0, 'Should have wood materials');
  assert.ok(woods.every(m => m.category === MaterialCategory.WOOD), 'All should be woods');
  
  const hides = getMaterialsByCategory(MaterialCategory.HIDE);
  assert.ok(hides.length > 0, 'Should have hide materials');
  assert.ok(hides.every(m => m.category === MaterialCategory.HIDE), 'All should be hides');
  
  const herbs = getMaterialsByCategory(MaterialCategory.HERB);
  assert.ok(herbs.length > 0, 'Should have herb materials');
  
  const bones = getMaterialsByCategory(MaterialCategory.BONE);
  assert.ok(bones.length > 0, 'Should have bone materials');
  
  const essences = getMaterialsByCategory(MaterialCategory.ESSENCE);
  assert.ok(essences.length > 0, 'Should have essence materials');
  
  const fibers = getMaterialsByCategory(MaterialCategory.FIBER);
  assert.ok(fibers.length > 0, 'Should have fiber materials');
  
  console.log(`✓ Get materials by category: Ores=${ores.length}, Woods=${woods.length}, Hides=${hides.length}, Herbs=${herbs.length}, Bones=${bones.length}, Essences=${essences.length}, Fibers=${fibers.length}`);
});

test('Materials - Get materials by rarity', () => {
  const common = getMaterialsByRarity(MaterialRarity.COMMON);
  assert.ok(common.length > 0, 'Should have common materials');
  assert.ok(common.every(m => m.rarity === MaterialRarity.COMMON), 'All should be common');
  
  const uncommon = getMaterialsByRarity(MaterialRarity.UNCOMMON);
  assert.ok(uncommon.length > 0, 'Should have uncommon materials');
  
  const rare = getMaterialsByRarity(MaterialRarity.RARE);
  assert.ok(rare.length > 0, 'Should have rare materials');
  
  const epic = getMaterialsByRarity(MaterialRarity.EPIC);
  assert.ok(epic.length > 0, 'Should have epic materials');
  
  const legendary = getMaterialsByRarity(MaterialRarity.LEGENDARY);
  assert.ok(legendary.length > 0, 'Should have legendary materials');
  
  console.log(`✓ Rarity distribution: Common=${common.length}, Uncommon=${uncommon.length}, Rare=${rare.length}, Epic=${epic.length}, Legendary=${legendary.length}`);
});

test('Materials - Get materials by tier', () => {
  const tier1 = getMaterialsByTier(MaterialTier.TIER_1);
  assert.ok(tier1.length > 0, 'Should have Tier 1 materials');
  assert.ok(tier1.every(m => m.tier === MaterialTier.TIER_1), 'All should be Tier 1');
  
  const tier2 = getMaterialsByTier(MaterialTier.TIER_2);
  assert.ok(tier2.length > 0, 'Should have Tier 2 materials');
  
  const tier3 = getMaterialsByTier(MaterialTier.TIER_3);
  assert.ok(tier3.length > 0, 'Should have Tier 3 materials');
  
  const tier4 = getMaterialsByTier(MaterialTier.TIER_4);
  assert.ok(tier4.length > 0, 'Should have Tier 4 materials');
  
  const tier5 = getMaterialsByTier(MaterialTier.TIER_5);
  assert.ok(tier5.length > 0, 'Should have Tier 5 materials');
  
  const tier6 = getMaterialsByTier(MaterialTier.TIER_6);
  assert.ok(tier6.length > 0, 'Should have Tier 6 materials');
  
  console.log(`✓ Tier distribution: T1=${tier1.length}, T2=${tier2.length}, T3=${tier3.length}, T4=${tier4.length}, T5=${tier5.length}, T6=${tier6.length}`);
});

test('Materials - Get materials by source', () => {
  const mining = getMaterialsBySource(MaterialSource.MINING);
  assert.ok(mining.length > 0, 'Should have mining materials');
  
  const gathering = getMaterialsBySource(MaterialSource.GATHERING);
  assert.ok(gathering.length > 0, 'Should have gathering materials');
  
  const mobDrops = getMaterialsBySource(MaterialSource.MOB_DROP);
  assert.ok(mobDrops.length > 0, 'Should have mob drop materials');
  
  const bossDrops = getMaterialsBySource(MaterialSource.BOSS_DROP);
  assert.ok(bossDrops.length > 0, 'Should have boss drop materials');
  
  const raidDrops = getMaterialsBySource(MaterialSource.RAID_DROP);
  assert.ok(raidDrops.length > 0, 'Should have raid drop materials');
  
  console.log(`✓ Source distribution: Mining=${mining.length}, Gathering=${gathering.length}, Mob Drops=${mobDrops.length}, Boss Drops=${bossDrops.length}, Raid Drops=${raidDrops.length}`);
});

test('Materials - Get materials by use', () => {
  const crafting = getMaterialsByUse(MaterialUse.CRAFTING);
  assert.ok(crafting.length > 0, 'Should have crafting materials');
  assert.ok(crafting.every(m => m.possibleUses.includes(MaterialUse.CRAFTING)), 'All should be craftable');
  
  const selling = getMaterialsByUse(MaterialUse.SELLING);
  assert.ok(selling.length > 0, 'Should have sellable materials');
  
  const enchanting = getMaterialsByUse(MaterialUse.ENCHANTING);
  assert.ok(enchanting.length > 0, 'Should have enchanting materials');
  
  const potionIngredients = getMaterialsByUse(MaterialUse.POTION_INGREDIENT);
  assert.ok(potionIngredients.length > 0, 'Should have potion ingredient materials');
  
  const foodIngredients = getMaterialsByUse(MaterialUse.FOOD_INGREDIENT);
  assert.ok(foodIngredients.length > 0, 'Should have food ingredient materials');
  
  const classReq = getMaterialsByUse(MaterialUse.CLASS_REQUIREMENT);
  assert.ok(classReq.length > 0, 'Should have class requirement materials');
  
  console.log(`✓ Use distribution: Crafting=${crafting.length}, Selling=${selling.length}, Enchanting=${enchanting.length}, Potion=${potionIngredients.length}, Food=${foodIngredients.length}, Class Req=${classReq.length}`);
});

test('Materials - Get materials by minimum level', () => {
  const level45 = getMaterialsByMinLevel(45);
  assert.ok(level45.length > 0, 'Should have materials requiring level 45+');
  assert.ok(level45.every(m => (m.requiredLevel || 0) >= 45), 'All should require level 45+');
  
  const level70 = getMaterialsByMinLevel(70);
  assert.ok(level70.length > 0, 'Should have materials requiring level 70+');
  
  const level90 = getMaterialsByMinLevel(90);
  assert.ok(level90.length > 0, 'Should have materials requiring level 90+');
  
  console.log(`✓ Level requirements: 45+ = ${level45.length}, 70+ = ${level70.length}, 90+ = ${level90.length}`);
});

test('Materials - Get materials by prefix', () => {
  const iron = getMaterialsByPrefix('iron');
  assert.ok(iron.length > 0, 'Should have iron materials');
  assert.ok(iron.every(m => m.id.startsWith('iron')), 'All should start with iron');
  
  const dragon = getMaterialsByPrefix('dragon');
  assert.ok(dragon.length > 0, 'Should have dragon materials');
  assert.ok(dragon.every(m => m.id.startsWith('dragon')), 'All should start with dragon');
  
  const gold = getMaterialsByPrefix('gold');
  assert.ok(gold.length > 0, 'Should have gold materials');
  
  console.log(`✓ Prefix search: iron=${iron.length}, dragon=${dragon.length}, gold=${gold.length}`);
});

test('Materials - Get all material IDs', () => {
  const ids = getAllMaterialIds();
  assert.ok(ids.length > 0, 'Should have material IDs');
  assert.ok(ids.includes('iron_ore'), 'Should include iron_ore');
  assert.ok(ids.includes('dragon_scale'), 'Should include dragon_scale');
  assert.ok(ids.includes('phoenix_feather'), 'Should include phoenix_feather');
  
  console.log(`✓ Total material IDs: ${ids.length}`);
});

test('Materials - Convenience lookup functions', () => {
  const basic = getBasicMaterials();
  assert.ok(basic.length > 0, 'Should have basic materials');
  assert.ok(basic.every(m => m.tier === MaterialTier.TIER_1), 'All should be Tier 1');
  
  const crafting = getCraftingMaterials();
  assert.ok(crafting.length > 0, 'Should have crafting materials');
  
  const sellable = getSellableMaterials();
  assert.ok(sellable.length > 0, 'Should have sellable materials');
  
  const mobDrops = getMonsterDropMaterials();
  assert.ok(mobDrops.length > 0, 'Should have monster drop materials');
  
  const bossDrops = getBossDropMaterials();
  assert.ok(bossDrops.length > 0, 'Should have boss drop materials');
  
  const legendary = getLegendaryMaterials();
  assert.ok(legendary.length > 0, 'Should have legendary materials');
  assert.ok(legendary.every(m => m.rarity === MaterialRarity.LEGENDARY), 'All should be legendary');
  
  const epic = getEpicMaterials();
  assert.ok(epic.length > 0, 'Should have epic materials');
  assert.ok(epic.every(m => m.rarity === MaterialRarity.EPIC), 'All should be epic');
  
  console.log(`✓ Convenience lookups: Basic=${basic.length}, Crafting=${crafting.length}, Sellable=${sellable.length}, MobDrops=${mobDrops.length}, BossDrops=${bossDrops.length}, Legendary=${legendary.length}, Epic=${epic.length}`);
});

test('Materials - Rarity helper functions', () => {
  // getMaterialRarityColor
  assert.equal(getMaterialRarityColor(MaterialRarity.COMMON), '#9d9d9d');
  assert.equal(getMaterialRarityColor(MaterialRarity.UNCOMMON), '#1eff00');
  assert.equal(getMaterialRarityColor(MaterialRarity.RARE), '#0070dd');
  assert.equal(getMaterialRarityColor(MaterialRarity.EPIC), '#a335ee');
  assert.equal(getMaterialRarityColor(MaterialRarity.LEGENDARY), '#ff8000');
  
  // getRarityMultiplier
  assert.equal(getRarityMultiplier(MaterialRarity.COMMON), 1.0);
  assert.equal(getRarityMultiplier(MaterialRarity.UNCOMMON), 0.3);
  assert.equal(getRarityMultiplier(MaterialRarity.RARE), 0.1);
  assert.equal(getRarityMultiplier(MaterialRarity.EPIC), 0.01);
  assert.equal(getRarityMultiplier(MaterialRarity.LEGENDARY), 0.001);
  
  console.log('✓ Rarity helper functions work correctly');
});

test('Materials - Count functions', () => {
  const byCategory = getMaterialCountByCategory();
  assert.ok(byCategory[MaterialCategory.ORE] > 0, 'Should have ore count');
  assert.ok(byCategory[MaterialCategory.WOOD] > 0, 'Should have wood count');
  assert.ok(byCategory[MaterialCategory.HIDE] > 0, 'Should have hide count');
  assert.ok(byCategory[MaterialCategory.HERB] > 0, 'Should have herb count');
  assert.ok(byCategory[MaterialCategory.BONE] > 0, 'Should have bone count');
  assert.ok(byCategory[MaterialCategory.ESSENCE] > 0, 'Should have essence count');
  assert.ok(byCategory[MaterialCategory.FIBER] > 0, 'Should have fiber count');
  
  const byTier = getMaterialCountByTier();
  assert.ok(byTier[MaterialTier.TIER_1] > 0, 'Should have Tier 1 count');
  assert.ok(byTier[MaterialTier.TIER_2] > 0, 'Should have Tier 2 count');
  assert.ok(byTier[MaterialTier.TIER_3] > 0, 'Should have Tier 3 count');
  assert.ok(byTier[MaterialTier.TIER_4] > 0, 'Should have Tier 4 count');
  assert.ok(byTier[MaterialTier.TIER_5] > 0, 'Should have Tier 5 count');
  assert.ok(byTier[MaterialTier.TIER_6] > 0, 'Should have Tier 6 count');
  
  console.log(`✓ Count by category: Ores=${byCategory['ore']}, Woods=${byCategory['wood']}, Hides=${byCategory['hide']}, Herbs=${byCategory['herb']}, Bones=${byCategory['bone']}, Essences=${byCategory['essence']}, Fibers=${byCategory['fiber']}`);
  console.log(`✓ Count by tier: T1=${byTier[1]}, T2=${byTier[2]}, T3=${byTier[3]}, T4=${byTier[4]}, T5=${byTier[5]}, T6=${byTier[6]}`);
});

test('Materials - Material stats', () => {
  assert.ok(materialStats.totalMaterials > 0, 'Should have total materials');
  assert.ok(materialStats.byCategory, 'Should have by category stats');
  assert.ok(materialStats.byTier, 'Should have by tier stats');
  assert.ok(materialStats.byRarity, 'Should have by rarity stats');
  
  const totalFromStats = Object.values(materialStats.byCategory).reduce((a, b) => a + b, 0);
  assert.equal(totalFromStats, materialStats.totalMaterials, 'Category totals should match');
  
  console.log(`✓ Material stats: Total=${materialStats.totalMaterials}`);
  console.log(`✓ By rarity: Common=${materialStats.byRarity.common}, Uncommon=${materialStats.byRarity.uncommon}, Rare=${materialStats.byRarity.rare}, Epic=${materialStats.byRarity.epic}, Legendary=${materialStats.byRarity.legendary}`);
});

test('Materials - Individual material properties', () => {
  // Test iron ore
  const ironOre = getMaterial('iron_ore');
  assert.equal(ironOre.id, 'iron_ore');
  assert.equal(ironOre.name, 'Iron Ore');
  assert.equal(ironOre.description, 'A chunk of raw iron ore. Can be smelted into iron ingots.');
  assert.equal(ironOre.category, MaterialCategory.ORE);
  assert.equal(ironOre.tier, MaterialTier.TIER_1);
  assert.equal(ironOre.rarity, MaterialRarity.COMMON);
  assert.ok(ironOre.sources.includes(MaterialSource.MINING));
  assert.ok(ironOre.possibleUses.includes(MaterialUse.CRAFTING));
  assert.equal(ironOre.value, 5);
  assert.equal(ironOre.stackSize, 99);
  
  // Test dragon scale (high tier)
  const dragonScale = getMaterial('dragon_scale');
  assert.equal(dragonScale.id, 'dragon_scale');
  assert.equal(dragonScale.name, 'Dragon Scale');
  assert.equal(dragonScale.tier, MaterialTier.TIER_4);
  assert.equal(dragonScale.rarity, MaterialRarity.EPIC);
  assert.equal(dragonScale.value, 500);
  assert.equal(dragonScale.requiredLevel, 50);
  
  // Test phoenix feather (legendary)
  const phoenixFeather = getMaterial('phoenix_feather');
  assert.equal(phoenixFeather.id, 'phoenix_feather');
  assert.equal(phoenixFeather.tier, MaterialTier.TIER_5);
  assert.equal(phoenixFeather.rarity, MaterialRarity.LEGENDARY);
  assert.equal(phoenixFeather.value, 2500);
  assert.equal(phoenixFeather.requiredLevel, 70);
  assert.ok(phoenixFeather.possibleUses.includes(MaterialUse.CLASS_REQUIREMENT));
  
  console.log('✓ Individual material properties verified');
});

test('Materials - Material sources are correct', () => {
  // Mining materials
  const ironOre = getMaterial('iron_ore');
  assert.ok(ironOre.sources.includes(MaterialSource.MINING));
  
  // Gathering materials
  const moonFlower = getMaterial('moon_flower');
  assert.ok(moonFlower.sources.includes(MaterialSource.GATHERING));
  
  // Skinning materials
  const wolfHide = getMaterial('wolf_hide');
  assert.ok(wolfHide.sources.includes(MaterialSource.SKINNING));
  
  // Mob drop materials
  const magicDust = getMaterial('magic_dust');
  assert.ok(magicDust.sources.includes(MaterialSource.MOB_DROP));
  
  // Boss drop materials
  const dragonScale = getMaterial('dragon_scale');
  assert.ok(dragonScale.sources.includes(MaterialSource.BOSS_DROP));
  
  // Raid drop materials
  const phoenixFeather = getMaterial('phoenix_feather');
  assert.ok(phoenixFeather.sources.includes(MaterialSource.RAID_DROP));
  
  console.log('✓ Material sources are correctly assigned');
});

test('Materials - Get all materials', () => {
  const all = getAllMaterials();
  assert.ok(all.length > 0, 'Should have materials');
  assert.ok(all.length >= 100, 'Should have at least 100 materials'); // We added ~100 materials
  
  // Verify no duplicates
  const ids = all.map(m => m.id);
  const uniqueIds = new Set(ids);
  assert.equal(ids.length, uniqueIds.size, 'No duplicate material IDs');
  
  console.log(`✓ Total materials: ${all.length}`);
});
