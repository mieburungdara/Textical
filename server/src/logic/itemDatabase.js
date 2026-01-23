const stonesData = require('../data/items/stones.json');

class ItemDatabase {
    constructor() {
        this.cache = new Map();
        this.initialize();
    }

    initialize() {
        console.log("Initializing Master Item Database...");
        
        // Assemble Stones
        const templates = stonesData.TEMPLATES;
        const items = stonesData.ITEMS;

        for (let id in items) {
            const rawItem = items[id];
            const template = templates[rawItem.template] || {};
            
            // Composition: Template + Raw Data
            const finalItem = {
                id: id,
                ...template,
                ...rawItem
            };
            
            this.cache.set(id, finalItem);
        }
        
        console.log(`Loaded ${this.cache.size} items from stones.json`);
    }

    getItem(id) {
        return this.cache.get(id);
    }

    getAllByTag(tag) {
        return Array.from(this.cache.values()).filter(item => item.usage && item.usage.includes(tag));
    }
}

// Global Singleton
const instance = new ItemDatabase();
module.exports = instance;
