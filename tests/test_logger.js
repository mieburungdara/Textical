const logger = require('./server/src/utils/logger');

console.log('--- STARTING LOGGER TEST ---');

logger.info('Test INFO message');
logger.warn('Test WARN message');
logger.error('Test ERROR message');

// Test object logging
logger.info('Test OBJECT message', { key: 'value', number: 123 });

// Test error object logging
try {
    throw new Error('Test EXCEPTION');
} catch (error) {
    logger.error('Caught exception', error);
}

console.log('--- FINISHED LOGGER TEST ---');
console.log('Check logs/combined.log and logs/error.log for output.');
