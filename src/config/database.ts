import { Deals, PrismaClient } from '@prisma/client';

import { logError, logMessage } from '../lib/logger';

const prisma: PrismaClient = new PrismaClient();

export const getPrisma = (): PrismaClient => {
  return prisma;
};

export const connectPrisma = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logMessage('Connected to database');
  } catch (error) {
    const errorMessage = error as Error;
    logError(errorMessage.message);
  }
};


export const checkIfChannelListening = async (channelId: string): Promise<boolean> => {
  const deal: Deals | null = await prisma.deals.findFirst({
    where: {
      channel_id: channelId
    }
  });

  if (deal === null) {
    return true;
  } else if (deal.channel_id === channelId) {
    return false;
  }

  return false;
}

export const saveDealChannel = async (
  channelId: string,
  guildId: string, 
  authorId: string
): Promise<void> => {
  try {
    await prisma.deals.create({
      data: {
        channel_id: channelId,
        guild_id: guildId,
        author_id: authorId
      }
    });
  } catch (error) {
    const errorMessage = error as Error;
    logError(errorMessage.message);
  }
}