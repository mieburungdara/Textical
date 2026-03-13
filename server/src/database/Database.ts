import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

export class Database {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('Database connection successful');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  getClient(): PrismaClient {
    return this.prisma;
  }
}
