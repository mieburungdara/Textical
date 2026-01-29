const prisma = require('../db');

/**
 * BaseService
 * Provides a common foundation for all services, ensuring access to the DB
 * and providing utility methods.
 */
class BaseService {
    constructor() {
        this.db = prisma;
    }

    /**
     * Standard error wrapper for service methods.
     */
    handleError(error, context = "Service") {
        console.error(`[${context} Error]:`, error.message);
        throw error;
    }
}

module.exports = BaseService;
