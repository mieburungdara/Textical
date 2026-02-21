require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

/**
 * Centralized PrismaClient instance for the Textical engine.
 * @returns {PrismaClient} singleton instance
 */
const prisma = new PrismaClient();

module.exports = prisma;
