const stonesData = require('../data/items/stones.json');

class ItemRepository {
    constructor() {
        this.cache = new Map();
        this._initialize();
    }

    _initialize() {
        const templates = stonesData.TEMPLATES;
        const items = stonesData.ITEMS;
        for (let id in items) {
            const rawItem = items[id];
            const template = templates[rawItem.template] || {};
            this.cache.set(id, { id, ...template, ...rawItem });
        }
    }

    getById(id) { return this.cache.get(id); }
    
    getAllByTag(tag) {
        return Array.from(this.cache.values()).filter(item => item.usage && item.usage.includes(tag));
    }
}

module.exports = new ItemRepository();
