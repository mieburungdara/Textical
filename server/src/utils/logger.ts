/**
 * Winston Logger Configuration
 * 
 * Provides centralized logging for the Textical server.
 * Following the Winston logging rule from .kilocode/rules/winston_logging_rule.md
 */

import winston from 'winston';

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'textical-server' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(meta).length > 0 && meta.service) {
            // Don't include service meta in output
          }
          if (stack) {
            msg += `\n${stack}`;
          }
          return msg;
        })
      )
    })
  ]
});

export default logger;

// Export typed log functions for convenience
export const log = {
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  error: (message: string, meta?: any) => logger.error(message, meta)
};
