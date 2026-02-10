const BaseController = require('./BaseController');
const assetService = require('../services/assetService');
const prisma = require('../db');

class AssetController extends BaseController {
    async getTemplates(req, res) {
        await this.execute(res, async () => {
            const { category } = req.params;
            let data;

            switch(category) {
                case 'monsters':
                    data = await prisma.monsterTemplate.findMany({ include: { category: true } });
                    break;
                case 'recipes':
                    data = await prisma.recipeTemplate.findMany({ include: { resultItem: true, ingredients: { include: { item: true } } } });
                    break;
                case 'items':
                    data = await prisma.itemTemplate.findMany();
                    break;
                default:
                    return this.sendError(res, "Invalid template category", 400);
            }

            this.sendSuccess(res, data);
        });
    }

    async getManifest(req, res) {
        await this.execute(res, async () => {
            const manifest = await assetService.getManifest();
            this.sendSuccess(res, manifest);
        });
    }

    async getRawAsset(req, res) {
        await this.execute(res, async () => {
            const { category, id } = req.params;
            const data = await assetService.getRawAsset(category, id);
            this.sendSuccess(res, data);
        });
    }
}

module.exports = new AssetController();
