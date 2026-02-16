const winston = require('winston');
const path = require('path');

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

// Define log directory
const logDir = path.join(__dirname, '../../logs');

// Define custom format for console output
const consoleFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

// Create the logger instance
const logger = winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }), // Log the full stack trace on errors
        winston.format.json() // Default format for file transports
    ),
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        //
        new winston.transports.File({ 
            filename: path.join(logDir, 'error.log'), 
            level: 'error',
            maxsize: 51200, // 50KB
            maxFiles: 1,
            tailable: true
        }),
        //
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ 
            filename: path.join(logDir, 'combined.log'),
            maxsize: 51200, // 50KB
            maxFiles: 1,
            tailable: true
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ 
            filename: path.join(logDir, 'exceptions.log'),
            maxsize: 51200, // 50KB 
            maxFiles: 1 
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({ 
            filename: path.join(logDir, 'rejections.log'), 
            maxsize: 51200, // 50KB
            maxFiles: 1 
        })
    ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (!isProduction) {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            consoleFormat
        ),
        handleExceptions: true // Also log exceptions to console in dev
    }));
} else {
    // In production, we might still want console logs (e.g. for tailored cloud logging services)
    // but typically JSON format is preferred.
    logger.add(new winston.transports.Console({
        format: winston.format.json(),
        handleExceptions: true
    }));
}

module.exports = logger;
