const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const vitalityService = require('../services/vitalityService');
const inventoryService = require('../services/inventoryService');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.findUnique({ where: { username } });
        
        if (!user) return res.status(404).json({ error: "User not found" });
        
        // Simple password check (In production, use bcrypt)
        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid password" });
        }
        
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        // Sync vitality before returning
        const user = await vitalityService.syncUserVitality(userId);
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getHeroes = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const heroes = await prisma.hero.findMany({
            where: { userId },
            include: { combatClass: true, equipment: true }
        });
        res.json(heroes);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getInventory = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const items = await prisma.inventoryItem.findMany({
            where: { userId },
            include: { template: true }
        });
        const status = await inventoryService.getStatus(userId);
        res.json({ status, items });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getRecipes = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const userRecipes = await prisma.userRecipe.findMany({
            where: { userId },
            include: { 
                recipe: { 
                    include: { 
                        ingredients: { include: { item: true } },
                        resultItem: true 
                    } 
                } 
            }
        });
        res.json(userRecipes.map(ur => ur.recipe));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getFormation = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        // For simplicity, we assume the user has at least one preset (created during seed)
        const preset = await prisma.formationPreset.findFirst({
            where: { userId },
            include: { slots: true }
        });
        res.json(preset);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getActiveTask = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const task = await prisma.taskQueue.findFirst({
            where: { userId, status: "RUNNING" }
        });
        res.json(task || null); // Return null if idle
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
