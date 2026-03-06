import { PrismaClient } from '@prisma/client';

export class PlayerManager {
  private prisma: PrismaClient;

  constructor(database: { getClient(): PrismaClient }) {
    this.prisma = database.getClient();
  }

  async createPlayer(playerData: { name: string; classType: string }): Promise<any> {
    return await this.prisma.player.create({
      data: playerData
    });
  }

  async getPlayer(id: string): Promise<any | null> {
    return await this.prisma.player.findUnique({
      where: { id }
    });
  }

  async updatePlayer(id: string, data: any): Promise<any> {
    return await this.prisma.player.update({
      where: { id },
      data
    });
  }
}
