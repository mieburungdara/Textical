/**
 * BaseController
 * Provides standard response handling and utility methods for all controllers.
 */
class BaseController {
    constructor() {
        if (this.constructor === BaseController) {
            throw new TypeError('Abstract class "BaseController" cannot be instantiated directly.');
        }
    }

    /**
     * Standard Success Response
     */
    sendSuccess(res, data, message = "Success") {
        return res.json({
            success: true,
            message,
            data
        });
    }

    /**
     * Standard Error Response
     */
    sendError(res, error, status = 400) {
        return res.status(status).json({
            success: false,
            error: typeof error === 'string' ? error : error.message
        });
    }

    /**
     * Wraps an async function to catch errors and pass them to sendError.
     */
    async execute(res, action) {
        try {
            await action();
        } catch (e) {
            return this.sendError(res, e);
        }
    }
}

module.exports = BaseController;
