const BaseController = require('./BaseController');
const assetService = require('../services/assetService');

class AssetController extends BaseController {
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
