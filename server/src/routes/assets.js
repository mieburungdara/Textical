/**
 * Assets Route
 * REST API for template asset downloads and version checking
 * 
 * Endpoints:
 * - GET /assets/versions - Get current versions for all categories
 * - GET /assets/manifest - Get full manifest with entry list
 * - GET /assets/raw/:category/:id - Get single asset file
 * - POST /assets/bump/:category - Bump version for a category (admin)
 */

const express = require('express');
const router = express.Router();
const versionManager = require('../services/asset/VersionManager');
const assetService = require('../services/assetService');
const path = require('path');
const fs = require('fs');

const ASSET_ROOT = path.join(__dirname, '../../public/assets/raw');

/**
 * GET /assets/versions
 * Get current server versions for all template categories
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     versions: {
 *       items: 15,
 *       monsters: 8,
 *       regions: 3,
 *       ...
 *     },
 *     timestamp: "2026-02-12T..."
 *   }
 * }
 */
router.get('/versions', async (req, res) => {
    try {
        const versions = await versionManager.getAllVersions();
        
        res.json({
            success: true,
            data: {
                versions,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('[AssetsRoute] Error getting versions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get versions: ' + error.message
        });
    }
});

/**
 * GET /assets/manifest
 * Get full manifest with entry list per category
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     items: {
 *       version: 15,
 *       entries: [{id: 2001, version: 1}, {id: 2002, version: 2}, ...]
 *     },
 *     monsters: { ... },
 *     ...
 *   }
 * }
 */
router.get('/manifest', async (req, res) => {
    try {
        const manifest = await versionManager.getManifest();
        
        res.json({
            success: true,
            data: manifest
        });
    } catch (error) {
        console.error('[AssetsRoute] Error getting manifest:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get manifest: ' + error.message
        });
    }
});

/**
 * GET /assets/raw/:category/:id
 * Get single asset file (from disk or database)
 * 
 * Tries disk first for performance, falls back to database
 */
router.get('/raw/:category/:id', async (req, res) => {
    try {
        const { category, id } = req.params;
        
        // DEBUG: Log request
        console.log(`[AssetsRoute.DEBUG] Requested: /assets/raw/${category}/${id}`);
        
        // Validate category
        const validCategories = versionManager.CATEGORIES;
        if (!validCategories.includes(category)) {
            console.log(`[AssetsRoute.DEBUG] Invalid category: ${category}`);
            return res.status(400).json({
                success: false,
                error: 'Invalid category: ' + category
            });
        }
        
        // Try disk first (faster)
        const filePath = path.join(ASSET_ROOT, category, `${id}.json`);
        console.log(`[AssetsRoute.DEBUG] Checking disk: ${filePath}`);
        
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            console.log(`[AssetsRoute.DEBUG] Serving from disk: ${filePath}`);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return res.send(content);
        }
        
        console.log(`[AssetsRoute.DEBUG] File not on disk, querying database...`);
        
        // Fallback to database
        const asset = await versionManager.getAsset(category, id);
        
        if (!asset) {
            console.log(`[AssetsRoute.DEBUG] Asset not found in DB: ${category}/${id}`);
            return res.status(404).json({
                success: false,
                error: 'Asset not found: ' + category + '/' + id
            });
        }
        
        console.log(`[AssetsRoute.DEBUG] Serving from database: ${category}/${id}`);
        res.json({
            success: true,
            data: asset
        });
    } catch (error) {
        console.error('[AssetsRoute] Error getting asset:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get asset: ' + error.message
        });
    }
});

/**
 * GET /assets/:category
 * Get list of all entries for a category
 */
router.get('/:category', async (req, res) => {
    try {
        const { category } = req.params;
        
        // Validate category
        const validCategories = versionManager.CATEGORIES;
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid category: ' + category
            });
        }
        
        const version = await versionManager.getCategoryVersion(category);
        const manifest = await versionManager.getManifest();
        const entries = manifest[category]?.entries || [];
        
        res.json({
            success: true,
            data: {
                category,
                version,
                count: entries.length,
                entries
            }
        });
    } catch (error) {
        console.error('[AssetsRoute] Error getting category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get category: ' + error.message
        });
    }
});

/**
 * POST /assets/bump/:category
 * Increment version for a category (forces client update)
 * Useful for hotfixes without game patch
 */
router.post('/bump/:category', async (req, res) => {
    try {
        const { category } = req.params;
        
        // Validate category
        const validCategories = versionManager.CATEGORIES;
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid category: ' + category
            });
        }
        
        const newVersion = await versionManager.bumpVersion(category);
        
        res.json({
            success: true,
            data: {
                category,
                oldVersion: newVersion - 1,
                newVersion
            }
        });
    } catch (error) {
        console.error('[AssetsRoute] Error bumping version:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to bump version: ' + error.message
        });
    }
});

/**
 * POST /assets/sync-all
 * Trigger full sync (mirror DB to disk) - Admin only
 */
router.post('/sync-all', async (req, res) => {
    try {
        await assetService.loadAllAssets();
        
        res.json({
            success: true,
            message: 'Full sync completed'
        });
    } catch (error) {
        console.error('[AssetsRoute] Error syncing assets:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sync: ' + error.message
        });
    }
});

module.exports = router;
