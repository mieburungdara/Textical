const travelService = require('../services/travelService');
const gatheringService = require('../services/gatheringService');
const craftingService = require('../services/craftingService');
const tavernService = require('../services/tavernService');
const marketService = require('../services/marketService');
const battleService = require('../services/battleService');
const questService = require('../services/questService');
const vitalityService = require('../services/vitalityService');
const formationService = require('../services/formationService');
const equipmentService = require('../services/equipmentService');
const prisma = require('../db'); // SHARED INSTANCE

const assetService = require('../services/assetService');

// --- ASSETS ---
exports.getManifest = async (req, res) => {
    try {
        const manifest = await assetService.getManifest();
        res.json(manifest);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getRawAsset = async (req, res) => {
    try {
        const { category, id } = req.params;
        const data = await assetService.getRawAsset(category, id);
        res.json(data);
    } catch (e) { res.status(404).json({ error: e.message }); }
};

// --- TRAVEL ---
exports.travel = async (req, res) => {
    try {
        const { userId, targetRegionId } = req.body;
        const task = await travelService.startTravel(userId, targetRegionId);
        res.json(task);
    } catch (e) { res.status(400).json({ error: e.message }); }
};

// --- GATHER ---
exports.gather = async (req, res) => {
    try {
        const { userId, heroId, resourceId } = req.body;
        const task = await gatheringService.startGathering(userId, heroId, resourceId);
        res.json(task);
    } catch (e) { res.status(400).json({ error: e.message }); }
};

// --- CRAFT ---
exports.craft = async (req, res) => {
    try {
        const { userId, recipeId } = req.body;
        const task = await craftingService.startCrafting(userId, recipeId);
        res.json(task);
    } catch (e) { res.status(400).json({ error: e.message }); }
};

// --- TAVERN ---
exports.enterTavern = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await vitalityService.enterTavern(userId);
        res.json({ message: "Entered Tavern", user });
    } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.exitTavern = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await vitalityService.exitTavern(userId);
        res.json({ message: "Exited Tavern", user });
    } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.getMercenaries = async (req, res) => {
    try {
        const userId = parseInt(req.query.userId);
        const list = await tavernService.getAvailableMercenaries(userId);
        res.json(list);
    } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.recruit = async (req, res) => {
    try {
        const { userId, mercenaryId } = req.body;
        await tavernService.recruitMercenary(userId, mercenaryId);
        res.json({ success: true });
    } catch (e) { res.status(400).json({ error: e.message }); }
};

// --- MARKET ---
exports.getListings = async (req, res) => {
    try {
        const userId = parseInt(req.query.userId);
        const list = await marketService.getActiveListings(userId);
        res.json(list);
    } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.listMarketItem = async (req, res) => {
    try {
        const { userId, itemId, price } = req.body;
        await marketService.listItem(userId, itemId, price);
        res.json({ success: true });
    } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.buyMarketItem = async (req, res) => {
    try {
        const { userId, listingId } = req.body;
        await marketService.purchaseItem(userId, listingId);
        res.json({ success: true });
    } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.sellToNPC = async (req, res) => {
    try {
        const { userId, itemId } = req.body;
        await marketService.npcSell(userId, itemId);
        res.json({ success: true });
    } catch (e) { res.status(400).json({ error: e.message }); }
};

// --- QUESTS ---
exports.getQuests = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const quests = await questService.getActiveQuests(userId);
        res.json(quests);
    } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.completeQuest = async (req, res) => {
    try {
        const { userId, userQuestId } = req.body;
        await questService.completeQuest(userId, userQuestId);
        res.json({ success: true });
    } catch (e) { res.status(400).json({ error: e.message }); }
};

// --- BATTLE ---
exports.startBattle = async (req, res) => {
    try {
        const { userId, monsterId } = req.body;
        const result = await battleService.startBattle(userId, monsterId);
        res.json(result);
    } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.updateFormation = async (req, res) => {
    try {
        const { userId, presetId, slots } = req.body;
        const result = await formationService.updateFormation(userId, presetId, slots);
        res.json({ success: true, result });
    } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.moveFormationUnit = async (req, res) => {
    try {
        const { userId, presetId, heroId, gridX, gridY } = req.body;
        const result = await formationService.moveUnit(userId, presetId, heroId, gridX, gridY);
        res.json({ success: true, result });
    } catch (e) { res.status(400).json({ error: e.message }); }
};

// --- EQUIPMENT ---
exports.equipItem = async (req, res) => {
    try {
        const { userId, heroId, itemInstanceId, slotKey } = req.body;
        const result = await equipmentService.equipItem(userId, heroId, itemInstanceId, slotKey);
        res.json({ success: true, result });
    } catch (e) { res.status(400).json({ error: e.message }); }
};

exports.unequipItem = async (req, res) => {
    try {
        const { userId, heroId, slotKey } = req.body;
        await equipmentService.unequipItem(userId, heroId, slotKey);
        res.json({ success: true });
    } catch (e) { res.status(400).json({ error: e.message }); }
};

// --- HERO PROFILE ---
exports.getHeroProfile = async (req, res) => {
    try {
        const heroId = parseInt(req.params.id);
        const profile = await formationService.getHeroCombatProfile(heroId);
        res.json(profile);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getUserProfile = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        // Sync vitality first
        await vitalityService.syncUserVitality(userId);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { 
                inventory: { include: { template: true } },
                taskQueue: { 
                    where: { status: "RUNNING" },
                    include: { targetRegion: true }
                },
                premiumTier: true,
                region: true // This is the RegionTemplate relation
            }
        });
        
        if (!user) return res.status(404).json({ error: "User not found" });

        // Build a robust activeTask object with clear type metadata
        const activeTask = user.taskQueue.length > 0 ? {
            ...user.taskQueue[0],
            targetRegionType: user.taskQueue[0].targetRegion ? user.taskQueue[0].targetRegion.type : "TOWN",
            targetRegionName: user.taskQueue[0].targetRegion ? user.taskQueue[0].targetRegion.name : "Destination"
        } : null;
        
        // Ensure the current region's type is always accessible
        const regionMetadata = user.region ? { type: user.region.type, name: user.region.name } : { type: "TOWN", name: "Unknown" };

        res.json({ 
            ...user, 
            activeTask,
            currentRegionData: regionMetadata // Explicit metadata for the client
        });
    } catch (e) { res.status(400).json({ error: e.message }); }
};

// --- REGION ---
exports.getAllRegions = async (req, res) => {
    try {
        const regions = await prisma.regionTemplate.findMany({
            include: { connections: true }
        });
        res.json(regions);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getRegionDetails = async (req, res) => {
    try {
        const regionId = parseInt(req.params.id);
        const region = await prisma.regionTemplate.findUnique({
            where: { id: regionId },
            include: { 
                resources: { include: { item: true } },
                connections: { include: { target: true } }
            }
        });
        res.json(region);
    } catch (e) { res.status(500).json({ error: e.message }); }
};
