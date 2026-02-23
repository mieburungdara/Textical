/**
 * AppError - Standardized Application Error Class
 * 
 * This class extends the native Error to include:
 * - Error code (standardized across the application)
 * - HTTP status code
 * - Additional context data
 * 
 * @see docs/ERROR_CODES.md for error code reference
 */

const ErrorCodes = require('../constants/ErrorCodes');

/**
 * HTTP Status Code mapping for common error types
 */
const HttpStatus = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
};

/**
 * Default HTTP status mapping based on error code prefix
 */
const DefaultHttpStatus = {
    AUTH: HttpStatus.UNAUTHORIZED,
    USER: HttpStatus.BAD_REQUEST,
    HERO: HttpStatus.BAD_REQUEST,
    ENERGY: HttpStatus.BAD_REQUEST,
    INVENTORY: HttpStatus.BAD_REQUEST,
    EQUIP: HttpStatus.BAD_REQUEST,
    TRAVEL: HttpStatus.BAD_REQUEST,
    TAVERN: HttpStatus.BAD_REQUEST,
    MARKET: HttpStatus.BAD_REQUEST,
    FORMATION: HttpStatus.BAD_REQUEST,
    COMBAT: HttpStatus.BAD_REQUEST,
    CONSUMABLE: HttpStatus.BAD_REQUEST,
    CRAFT: HttpStatus.BAD_REQUEST,
    GATHER: HttpStatus.BAD_REQUEST,
    QUEST: HttpStatus.BAD_REQUEST,
    GUILD: HttpStatus.BAD_REQUEST,
    TERRITORY: HttpStatus.BAD_REQUEST,
    PROPERTY: HttpStatus.BAD_REQUEST,
    NPC: HttpStatus.BAD_REQUEST,
    CHAT: HttpStatus.BAD_REQUEST,
    MAIL: HttpStatus.BAD_REQUEST,
    INN: HttpStatus.BAD_REQUEST,
    GAMBLE: HttpStatus.BAD_REQUEST,
    FACTION: HttpStatus.BAD_REQUEST,
    BOUNTY: HttpStatus.BAD_REQUEST,
    SIEGE: HttpStatus.BAD_REQUEST,
    RUMOR: HttpStatus.BAD_REQUEST,
    DAILY: HttpStatus.BAD_REQUEST,
    TREASURE: HttpStatus.BAD_REQUEST,
    REPAIR: HttpStatus.BAD_REQUEST,
    BREED: HttpStatus.BAD_REQUEST,
    AUCTION: HttpStatus.BAD_REQUEST,
    MASTERY: HttpStatus.BAD_REQUEST,
    ESCORT: HttpStatus.BAD_REQUEST,
    WAGON: HttpStatus.BAD_REQUEST,
    MANA: HttpStatus.BAD_REQUEST,
    EVENT: HttpStatus.BAD_REQUEST,
    REPLAY: HttpStatus.BAD_REQUEST,
    LEADERBOARD: HttpStatus.BAD_REQUEST,
    BUILDING: HttpStatus.BAD_REQUEST,
    STAT: HttpStatus.BAD_REQUEST,
    ECONOMY: HttpStatus.BAD_REQUEST,
    PROMOTION: HttpStatus.BAD_REQUEST,
    ASSET: HttpStatus.BAD_REQUEST,
    GENERIC: HttpStatus.INTERNAL_SERVER_ERROR,
};

/**
 * AppError class for standardized error handling
 */
class AppError extends Error {
    /**
     * Create a new AppError
     * @param {string} code - Error code from ErrorCodes
     * @param {string} message - Human-readable error message
     * @param {Object} options - Additional options
     * @param {number} [options.statusCode] - HTTP status code (auto-detected if not provided)
     * @param {Object} [options.context] - Additional context data
     * @param {Error} [options.cause] - Original error that caused this error
     */
    constructor(code, message, options = {}) {
        super(message);
        
        this.name = 'AppError';
        this.code = code;
        this.statusCode = options.statusCode ?? this._getDefaultStatusCode(code);
        this.context = options.context ?? {};
        
        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        
        // Store cause if provided
        if (options.cause) {
            this.cause = options.cause;
        }
    }

    /**
     * Get default HTTP status code based on error code prefix
     * @param {string} code - Error code
     * @returns {number} HTTP status code
     */
    _getDefaultStatusCode(code) {
        const prefix = code.split('_')[0];
        return DefaultHttpStatus[prefix] ?? HttpStatus.BAD_REQUEST;
    }

    /**
     * Convert error to JSON for API response
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            success: false,
            error: this.code,
            message: this.message,
            ...(Object.keys(this.context).length > 0 && { context: this.context }),
        };
    }

    /**
     * Check if this error has a specific error code
     * @param {string} code - Error code to check
     * @returns {boolean}
     */
    is(code) {
        return this.code === code;
    }

    /**
     * Check if this error has any of the specified error codes
     * @param {...string} codes - Error codes to check
     * @returns {boolean}
     */
    isAny(...codes) {
        return codes.includes(this.code);
    }
}

/**
 * Factory methods for common error types
 */
AppError.create = {
    /**
     * Create a not found error
     * @param {string} entity - Entity type (e.g., 'User', 'Hero')
     * @param {string} code - Error code
     * @returns {AppError}
     */
    notFound: (entity, code) => {
        return new AppError(code, `${entity} not found`, { statusCode: HttpStatus.NOT_FOUND });
    },

    /**
     * Create an unauthorized error
     * @param {string} message - Error message
     * @param {string} code - Error code
     * @returns {AppError}
     */
    unauthorized: (message, code = ErrorCodes.AUTH_UNAUTHORIZED) => {
        return new AppError(code, message, { statusCode: HttpStatus.UNAUTHORIZED });
    },

    /**
     * Create a forbidden error
     * @param {string} message - Error message
     * @param {string} code - Error code
     * @returns {AppError}
     */
    forbidden: (message, code = ErrorCodes.AUTH_FORBIDDEN) => {
        return new AppError(code, message, { statusCode: HttpStatus.FORBIDDEN });
    },

    /**
     * Create a validation error
     * @param {string} message - Error message
     * @param {string} code - Error code
     * @param {Object} context - Validation context
     * @returns {AppError}
     */
    validation: (message, code, context = {}) => {
        return new AppError(code, message, { 
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            context 
        });
    },

    /**
     * Create an insufficient funds error
     * @param {string} currency - Currency type (e.g., 'Silver', 'Gold')
     * @param {string} code - Error code
     * @param {Object} context - Context with required and available amounts
     * @returns {AppError}
     */
    insufficientFunds: (currency, code, context = {}) => {
        const message = context.required 
            ? `Insufficient ${currency}. Need ${context.required}, have ${context.available ?? 0}`
            : `Insufficient ${currency}`;
        return new AppError(code, message, { context });
    },

    /**
     * Create a busy/occupied error
     * @param {string} entity - Entity that is busy
     * @param {string} code - Error code
     * @returns {AppError}
     */
    busy: (entity, code) => {
        return new AppError(code, `${entity} is busy with another task`);
    },
};

/**
 * Helper function to check if an error is an AppError
 * @param {Error} error - Error to check
 * @returns {boolean}
 */
function isAppError(error) {
    return error instanceof AppError;
}

/**
 * Helper function to convert any error to AppError
 * @param {Error} error - Error to convert
 * @param {string} [defaultCode] - Default error code if not an AppError
 * @returns {AppError}
 */
function toAppError(error, defaultCode = ErrorCodes.GENERIC_INVALID_INPUT) {
    if (isAppError(error)) {
        return error;
    }
    
    return new AppError(defaultCode, error.message, { cause: error });
}

/**
 * Helper function to create AppError from error code with message
 * This is the primary way to create errors in services
 * 
 * @param {string} code - Error code from ErrorCodes
 * @param {string} [message] - Optional custom message (uses code as message if not provided)
 * @param {Object} [context] - Optional context data
 * @returns {AppError}
 */
function error(code, message, context) {
    return new AppError(code, message ?? code, context ? { context } : undefined);
}

module.exports = {
    AppError,
    ErrorCodes,
    HttpStatus,
    isAppError,
    toAppError,
    error,
};
