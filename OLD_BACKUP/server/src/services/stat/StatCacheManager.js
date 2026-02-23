/**
 * StatCacheManager
 * Manages in-memory caching and invalidation for stat calculations.
 * Single Responsibility: cache lifecycle only.
 */

class StatCacheManager {
    /**
     * Create a new StatCacheManager.
     * @param {Object} options - Cache configuration options.
     * @param {boolean} [options.enabled=true] - Whether caching is enabled.
     * @param {number} [options.ttl=30000] - Cache TTL in milliseconds.
     * @param {string} [options.separator=':'] - Cache key segment separator.
     */
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.cache = new Map();
        this.ttl = options.ttl || 30000;
        this.separator = options.separator || ':';
    }

    /**
     * Generate a cache key from heroId and context.
     * @param {number} heroId - The hero ID.
     * @param {Object} context - Calculation context with optional contextType and regionId.
     * @returns {string} Cache key string.
     */
    getCacheKey(heroId, context = {}) {
        const parts = [`hero:${heroId}`];
        if (context.contextType) parts.push(`ctx:${context.contextType}`);
        if (context.regionId) parts.push(`reg:${context.regionId}`);
        return parts.join(this.separator);
    }

    /**
     * Retrieve a cached value by key.
     * @param {string} key - The cache key.
     * @returns {Object|undefined} Cached value or undefined if not found.
     */
    get(key) {
        if (!this.enabled) return undefined;
        return this.cache.get(key);
    }

    /**
     * Check whether a cached entry has expired.
     * @param {Object} cached - The cached object (must have calculatedAt).
     * @returns {boolean} True if expired or missing.
     */
    isExpired(cached) {
        if (!cached || !cached.calculatedAt) return true;
        const age = Date.now() - new Date(cached.calculatedAt).getTime();
        return age > this.ttl;
    }

    /**
     * Store a value in the cache.
     * @param {string} key - The cache key.
     * @param {Object} value - The value to store.
     */
    set(key, value) {
        if (!this.enabled) return;
        this.cache.set(key, value);
    }

    /**
     * Invalidate all cache entries for a specific hero.
     * @param {number} heroId - The hero ID to invalidate.
     */
    invalidateHero(heroId) {
        const prefix = `hero:${heroId}`;
        this.cache.forEach((_value, key) => {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        });
    }

    /**
     * Clear all cached entries.
     */
    clear() {
        this.cache.clear();
    }
}

module.exports = StatCacheManager;
