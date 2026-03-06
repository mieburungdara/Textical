import { PrismaClient } from '@prisma/client';

export class Database {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection failed:', error);
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
