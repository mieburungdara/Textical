const prisma = require('../db');

/**
 * AAA BaseService (Refactored)
 * The ultimate foundation for all Textical services.
 * Features: Unified DB, Centralized Logging, Transaction Helpers.
 */
class BaseService {
    constructor() {
        this.db = prisma;
    }

    /**
     * Unified logging standard
     */
    log(message, context = "Service") {
        console.log(`[${context}]: ${message}`);
    }

    /**
     * Standard error handler
     */
    handleError(error, context = "Service") {
        console.error(`❌ [${context} Error]:`, error.message);
        throw error;
    }

    /**
     * Transaction wrapper for database integrity
     */
    async runTransaction(callback) {
        try {
            return await this.db.$transaction(callback);
        } catch (e) {
            this.handleError(e, "Database Transaction");
        }
    }
}

module.exports = BaseService;