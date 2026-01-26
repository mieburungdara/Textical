const travelService = require('../services/travelService');
const gatheringService = require('../services/gatheringService');
const craftingService = require('../services/craftingService');
const tavernService = require('../services/tavernService');
const marketService = require('../services/marketService');
const battleService = require('../services/battleService');
const questService = require('../services/questService');
const vitalityService = require('../services/vitalityService');
const formationService = require('../services/formationService');

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
        const { PrismaClient } = require('@prisma/client');
        const _prisma = new PrismaClient();
        const userId = parseInt(req.params.id);
        const user = await _prisma.user.findUnique({
            where: { id: userId },
            include: { 
                inventory: { include: { template: true } },
                taskQueue: { 
                    where: { status: "RUNNING" },
                    include: { targetRegion: true } // Include destination metadata
                },
                premiumTier: true,
                region: true 
            }
        });
        await _prisma.$disconnect();
        
        // Consistent Flattening with Enriched Metadata
        const activeTask = user.taskQueue.length > 0 ? {
            ...user.taskQueue[0],
            targetRegionType: user.taskQueue[0].targetRegion ? user.taskQueue[0].targetRegion.type : "TOWN",
            targetRegionName: user.taskQueue[0].targetRegion ? user.taskQueue[0].targetRegion.name : "Destination"
        } : null;
        
        res.json({ ...user, activeTask });
    } catch (e) { res.status(400).json({ error: e.message }); }
};

// --- REGION ---
exports.getAllRegions = async (req, res) => {
    try {
        const { PrismaClient } = require('@prisma/client');
        const _prisma = new PrismaClient();
        const regions = await _prisma.regionTemplate.findMany({
            include: { connections: true }
        });
        await _prisma.$disconnect();
        res.json(regions);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getRegionDetails = async (req, res) => {
    try {
        const regionId = parseInt(req.params.id);
        const prisma = require('@prisma/client').PrismaClient; // Lazy load if not global
        const db = new (require('@prisma/client').PrismaClient)(); // Or use existing if accessible, but for safety in this file edit:
        
        // Re-using the existing prisma instance would be better if it was exported, 
        // but checking the file content, 'prisma' is not exported. 
        // I will use the imports from the top of the file if available.
        // Checking file content... 'const prisma' is NOT defined in this file, it imports services.
        // Actually, services use prisma. I should probably put this in a service or just import prisma here.
        // Let's import prisma at the top of the file for this function.
        
        // Wait, I can't easily add import at top with 'replace'. 
        // I'll assume 'prisma' isn't available and use a Service or standard import inside the function.
        
        // Better approach: Add a helper in 'TravelService' or just raw prisma here. 
        // I'll use a new instance for this specific read operation to be safe and quick.
        const { PrismaClient } = require('@prisma/client');
        const _prisma = new PrismaClient();
        
        const region = await _prisma.regionTemplate.findUnique({
            where: { id: regionId },
            include: { 
                resources: { include: { item: true } },
                connections: { include: { target: true } }
            }
        });
        await _prisma.$disconnect();
        
        res.json(region);
    } catch (e) { res.status(500).json({ error: e.message }); }
};
