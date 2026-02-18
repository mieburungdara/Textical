const prisma = require('../db');
const logger = require('../utils/logger');

/**
 * PrivateIslandService
 * Handles all business logic for Private Island farming system
 */
class PrivateIslandService {
    constructor() {
        this.UNLOCK_COST = 1; // 1 Gold
        this.DEFAULT_PLOTS = 10;
        this.DEFAULT_STORAGE = 10;
        this.MAX_PLOTS = 50;
        this.MAX_STORAGE = 50;
        this.UPGRADE_PLOT_COST_BASE = 10; // Gold per plot
        this.UPGRADE_STORAGE_COST_BASE = 5; // Gold per slot
    }

    /**
     * Get or create private island for user
     */
    async getOrCreateIsland(userId) {
        logger.debug(`[PrivateIslandService.getOrCreateIsland] userId: ${userId}`);
        
        let island = await prisma.privateIsland.findUnique({
            where: { userId },
            include: {
                plots: {
                    orderBy: { plotIndex: 'asc' }
                },
                storageItems: {
                    include: { itemTemplate: true },
                    orderBy: { slotIndex: 'asc' }
                }
            }
        });

        if (!island) {
            // Create new island with default plots
            island = await prisma.privateIsland.create({
                data: {
                    userId,
                    isUnlocked: false,
                    plotCount: this.DEFAULT_PLOTS,
                    storageSlotCount: this.DEFAULT_STORAGE,
                    maxPlots: this.MAX_PLOTS,
                    maxStorageSlots: this.MAX_STORAGE,
                    // Create initial empty plots
                    plots: {
                        create: Array.from({ length: this.DEFAULT_PLOTS }, (_, i) => ({
                            plotIndex: i,
                            status: 'EMPTY',
                            growthProgress: 0
                        }))
                    }
                },
                include: {
                    plots: {
                        orderBy: { plotIndex: 'asc' }
                    },
                    storageItems: {
                        include: { itemTemplate: true },
                        orderBy: { slotIndex: 'asc' }
                    }
                }
            });
            logger.info(`[PrivateIslandService.getOrCreateIsland] Created new island for user ${userId}`);
        }

        return island;
    }

    /**
     * Unlock private island for user (cost: 1 Gold)
     */
    async unlockIsland(userId) {
        logger.info(`[PrivateIslandService.unlockIsland] userId: ${userId}`);
        
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        if (user.gold < this.UNLOCK_COST) {
            throw new Error(`Insufficient gold. Need ${this.UNLOCK_COST} gold.`);
        }

        // Deduct gold
        await prisma.user.update({
            where: { id: userId },
            data: { gold: user.gold - this.UNLOCK_COST }
        });

        // Get or create island and unlock it
        const island = await this.getOrCreateIsland(userId);
        
        const updatedIsland = await prisma.privateIsland.update({
            where: { id: island.id },
            data: {
                isUnlocked: true,
                unlockedAt: new Date()
            },
            include: {
                plots: {
                    orderBy: { plotIndex: 'asc' }
                },
                storageItems: {
                    include: { itemTemplate: true },
                    orderBy: { slotIndex: 'asc' }
                }
            }
        });

        logger.info(`[PrivateIslandService.unlockIsland] Island unlocked for user ${userId}`);
        return {
            island: updatedIsland,
            goldSpent: this.UNLOCK_COST
        };
    }

    /**
     * Plant seed in a plot
     */
    async plant(userId, plotIndex, seedItemId) {
        logger.info(`[PrivateIslandService.plant] userId: ${userId}, plotIndex: ${plotIndex}, seedItemId: ${seedItemId}`);
        
        const island = await this.getOrCreateIsland(userId);
        
        if (!island.isUnlocked) {
            throw new Error('Island is not unlocked');
        }

        if (plotIndex >= island.plotCount) {
            throw new Error('Invalid plot index');
        }

        // Get the plot
        const plot = island.plots.find(p => p.plotIndex === plotIndex);
        
        if (!plot) {
            throw new Error('Plot not found');
        }

        if (plot.status !== 'EMPTY') {
            throw new Error('Plot is not empty');
        }

        // Verify seed item exists and is in inventory
        const seedItem = await prisma.inventoryItem.findFirst({
            where: {
                userId,
                templateId: seedItemId,
                isTrash: false
            },
            include: { template: true }
        });

        if (!seedItem) {
            throw new Error('Seed not found in inventory');
        }

        if (seedItem.template.category !== 'SEED') {
            throw new Error('Item is not a seed');
        }

        // Get crop template for this seed
        const cropTemplate = await prisma.cropTemplate.findUnique({
            where: { seedItemId }
        });

        if (!cropTemplate) {
            throw new Error('Crop template not found for this seed');
        }

        // Calculate harvest time
        const growthTimeMs = cropTemplate.growthTimeSeconds * 1000;
        const harvestAt = new Date(Date.now() + growthTimeMs);

        // Remove seed from inventory (decrease quantity)
        if (seedItem.quantity > 1) {
            await prisma.inventoryItem.update({
                where: { id: seedItem.id },
                data: { quantity: seedItem.quantity - 1 }
            });
        } else {
            await prisma.inventoryItem.delete({
                where: { id: seedItem.id }
            });
        }

        // Update plot with planted crop
        const updatedPlot = await prisma.gardenPlot.update({
            where: { id: plot.id },
            data: {
                cropTemplateId: cropTemplate.harvestItemId,
                seedItemId: seedItemId,
                plantedAt: new Date(),
                harvestAt: harvestAt,
                status: 'PLANTED',
                growthProgress: 0
            }
        });

        logger.info(`[PrivateIslandService.plant] Planted seed in plot ${plotIndex}`);
        
        return {
            plot: updatedPlot,
            cropName: cropTemplate.name,
            harvestAt: harvestAt
        };
    }

    /**
     * Harvest ready crops
     */
    async harvest(userId, plotIndex) {
        logger.info(`[PrivateIslandService.harvest] userId: ${userId}, plotIndex: ${plotIndex}`);
        
        const island = await this.getOrCreateIsland(userId);
        
        if (!island.isUnlocked) {
            throw new Error('Island is not unlocked');
        }

        const plot = island.plots.find(p => p.plotIndex === plotIndex);
        
        if (!plot) {
            throw new Error('Plot not found');
        }

        if (plot.status !== 'READY') {
            throw new Error('Crop is not ready for harvest');
        }

        // Get crop template
        const cropTemplate = await prisma.cropTemplate.findFirst({
            where: { harvestItemId: plot.cropTemplateId }
        });

        if (!cropTemplate) {
            throw new Error('Crop template not found');
        }

        // Calculate yield (random between min and max)
        const yieldAmount = Math.floor(
            Math.random() * (cropTemplate.maxYield - cropTemplate.minYield + 1)
        ) + cropTemplate.minYield;

        // Apply yield multiplier (could be upgraded later)
        const finalYield = Math.floor(yieldAmount * plot.yieldMultiplier);

        // Add harvest items to inventory
        const existingItem = await prisma.inventoryItem.findFirst({
            where: {
                userId,
                templateId: cropTemplate.harvestItemId
            }
        });

        if (existingItem) {
            await prisma.inventoryItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + finalYield }
            });
        } else {
            await prisma.inventoryItem.create({
                data: {
                    userId,
                    templateId: cropTemplate.harvestItemId,
                    quantity: finalYield,
                    currentDurability: 100,
                    maxDurability: 100
                }
            });
        }

        // Reset plot to empty
        const updatedPlot = await prisma.gardenPlot.update({
            where: { id: plot.id },
            data: {
                cropTemplateId: null,
                seedItemId: null,
                plantedAt: new Date(),
                harvestAt: null,
                status: 'EMPTY',
                growthProgress: 0,
                yieldMultiplier: 1.0
            }
        });

        logger.info(`[PrivateIslandService.harvest] Harvested ${finalYield} ${cropTemplate.name} from plot ${plotIndex}`);

        return {
            plot: updatedPlot,
            harvestedItem: cropTemplate.harvestItemId,
            harvestedItemName: cropTemplate.name,
            quantity: finalYield,
            experienceGained: cropTemplate.experienceReward
        };
    }

    /**
     * Update crop statuses (call this periodically)
     */
    async updateCropStatuses(userId) {
        logger.debug(`[PrivateIslandService.updateCropStatuses] userId: ${userId}`);
        
        const island = await this.getOrCreateIsland(userId);
        
        if (!island.isUnlocked) {
            return [];
        }

        const now = new Date();
        const updatedPlots = [];

        for (const plot of island.plots) {
            if (plot.status === 'PLANTED' || plot.status === 'GROWING') {
                if (plot.harvestAt && now >= plot.harvestAt) {
                    // Crop is ready
                    await prisma.gardenPlot.update({
                        where: { id: plot.id },
                        data: { status: 'READY' }
                    });
                    updatedPlots.push({ ...plot, status: 'READY' });
                } else if (plot.harvestAt) {
                    // Update growth progress
                    const totalGrowthTime = plot.harvestAt.getTime() - new Date(plot.plantedAt).getTime();
                    const elapsedTime = now.getTime() - new Date(plot.plantedAt).getTime();
                    const progress = Math.min(1, elapsedTime / totalGrowthTime);
                    
                    await prisma.gardenPlot.update({
                        where: { id: plot.id },
                        data: { 
                            growthProgress: progress,
                            status: progress >= 1 ? 'READY' : 'GROWING'
                        }
                    });

                }
            }
        }

        return updatedPlots;
    }

    /**
     * Get island data with updated crop statuses
     */
    async getIslandWithStatus(userId) {
        logger.debug(`[PrivateIslandService.getIslandWithStatus] userId: ${userId}`);
        
        // Update statuses first
        await this.updateCropStatuses(userId);
        
        // Return updated island
        return this.getOrCreateIsland(userId);
    }

    /**
     * Add item to island storage
     */
    async addToStorage(userId, itemTemplateId, quantity) {
        logger.info(`[PrivateIslandService.addToStorage] userId: ${userId}, itemTemplateId: ${itemTemplateId}, quantity: ${quantity}`);
        
        const island = await this.getOrCreateIsland(userId);
        
        if (!island.isUnlocked) {
            throw new Error('Island is not unlocked');
        }

        // Check storage capacity
        if (island.storageItems.length >= island.storageSlotCount) {
            throw new Error('Storage is full');
        }

        // Find next available slot
        const usedSlots = island.storageItems.map(s => s.slotIndex);
        let newSlotIndex = 0;
        while (usedSlots.includes(newSlotIndex)) {
            newSlotIndex++;
        }

        // Create storage item
        const storageItem = await prisma.islandStorageItem.create({
            data: {
                islandId: island.id,
                itemTemplateId,
                quantity,
                slotIndex: newSlotIndex
            },
            include: { itemTemplate: true }
        });

        logger.info(`[PrivateIslandService.addToStorage] Added item to storage: ${quantity}x item ${itemTemplateId}`);

        return storageItem;
    }

    /**
     * Remove item from island storage
     */
    async removeFromStorage(userId, storageItemId, quantity) {
        logger.info(`[PrivateIslandService.removeFromStorage] userId: ${userId}, storageItemId: ${storageItemId}, quantity: ${quantity}`);
        
        const island = await this.getOrCreateIsland(userId);
        
        if (!island.isUnlocked) {
            throw new Error('Island is not unlocked');
        }

        const storageItem = island.storageItems.find(s => s.id === storageItemId);
        
        if (!storageItem) {
            throw new Error('Storage item not found');
        }

        if (storageItem.quantity < quantity) {
            throw new Error('Not enough items in storage');
        }

        if (storageItem.quantity === quantity) {
            // Delete the item
            await prisma.islandStorageItem.delete({
                where: { id: storageItemId }
            });
        } else {
            // Update quantity
            await prisma.islandStorageItem.update({
                where: { id: storageItemId },
                data: { quantity: storageItem.quantity - quantity }
            });
        }

        logger.info(`[PrivateIslandService.removeFromStorage] Removed ${quantity} items from storage`);

        return { success: true };
    }

    /**
     * Upgrade plot count
     */
    async upgradePlots(userId) {
        logger.info(`[PrivateIslandService.upgradePlots] userId: ${userId}`);
        
        const island = await this.getOrCreateIsland(userId);
        
        if (!island.isUnlocked) {
            throw new Error('Island is not unlocked');
        }

        if (island.plotCount >= island.maxPlots) {
            throw new Error('Maximum plot count reached');
        }

        const upgradeCost = this.UPGRADE_PLOT_COST_BASE * (island.plotCount - this.DEFAULT_PLOTS + 1);
        
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (user.gold < upgradeCost) {
            throw new Error(`Insufficient gold. Need ${upgradeCost} gold.`);
        }

        // Deduct gold
        await prisma.user.update({
            where: { id: userId },
            data: { gold: user.gold - upgradeCost }
        });

        // Update island with new plot count (+10 plots per upgrade)
        const newPlotCount = island.plotCount + 10;
        const updatedIsland = await prisma.privateIsland.update({
            where: { id: island.id },
            data: { plotCount: newPlotCount }
        });

        // Create new empty plot
        await prisma.gardenPlot.create({
            data: {
                islandId: island.id,
                plotIndex: newPlotCount - 1,
                status: 'EMPTY',
                growthProgress: 0
            }
        });

        logger.info(`[PrivateIslandService.upgradePlots] Upgraded to ${newPlotCount} plots for ${upgradeCost} gold`);

        return {
            island: await this.getOrCreateIsland(userId),
            goldSpent: upgradeCost,
            newPlotCount
        };
    }

    /**
     * Upgrade storage slots
     */
    async upgradeStorage(userId) {
        logger.info(`[PrivateIslandService.upgradeStorage] userId: ${userId}`);
        
        const island = await this.getOrCreateIsland(userId);
        
        if (!island.isUnlocked) {
            throw new Error('Island is not unlocked');
        }

        if (island.storageSlotCount >= island.maxStorageSlots) {
            throw new Error('Maximum storage slots reached');
        }

        const upgradeCost = this.UPGRADE_STORAGE_COST_BASE * (island.storageSlotCount - this.DEFAULT_STORAGE + 1);
        
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (user.gold < upgradeCost) {
            throw new Error(`Insufficient gold. Need ${upgradeCost} gold.`);
        }

        // Deduct gold
        await prisma.user.update({
            where: { id: userId },
            data: { gold: user.gold - upgradeCost }
        });

        // Update island with new storage count (+10 slots per upgrade)
        const newStorageCount = island.storageSlotCount + 10;
        const updatedIsland = await prisma.privateIsland.update({
            where: { id: island.id },
            data: { storageSlotCount: newStorageCount }
        });

        logger.info(`[PrivateIslandService.upgradeStorage] Upgraded to ${newStorageCount} storage slots for ${upgradeCost} gold`);

        return {
            island: await this.getOrCreateIsland(userId),
            goldSpent: upgradeCost,
            newStorageCount
        };
    }

    /**
     * Get all available crop templates
     */
    async getCropTemplates() {
        logger.debug(`[PrivateIslandService.getCropTemplates]`);
        
        return prisma.cropTemplate.findMany({
            include: {
                seedItem: true,
                harvestItem: true
            }
        });
    }
}

module.exports = new PrivateIslandService();
