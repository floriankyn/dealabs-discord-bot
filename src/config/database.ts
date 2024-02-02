import {
  Deals,
  PrismaClient,
  Deals_recorded as dealsRecorded,
} from '@prisma/client';

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

export const checkIfChannelListening = async (
  channelId: string
): Promise<boolean> => {
  const deal: Deals | null = await prisma.deals.findFirst({
    where: {
      channel_id: channelId,
    },
  });

  if (deal === null) {
    return true;
  } else if (deal.channel_id === channelId) {
    return false;
  }

  return false;
};

export const saveDealChannel = async (
  channelId: string,
  guildId: string,
  authorId: string,
  slug: string,
  keyword: string | null
): Promise<void> => {
  try {
    await prisma.deals.create({
      data: {
        slug: slug,
        channel_id: channelId,
        guild_id: guildId,
        author_id: authorId,
        keyword: keyword === null ? '' : keyword,
      },
    });
  } catch (error) {
    const errorMessage = error as Error;
    logError(errorMessage.message);
  }
};

export const getDealChannels = async (): Promise<Deals[]> => {
  try {
    const deals: Deals[] = await prisma.deals.findMany();

    return deals;
  } catch (error) {
    const errorMessage = error as Error;
    logError(errorMessage.message);
  }

  return [];
};

export const getDealChannel = async (
  channelId: string
): Promise<Deals | null> => {
  try {
    const deal: Deals | null = await prisma.deals.findFirst({
      where: {
        channel_id: channelId,
      },
    });

    return deal;
  } catch (error) {
    const errorMessage = error as Error;
    logError(errorMessage.message);
  }

  return null;
};

export const removeDealChannel = async (channelId: string): Promise<void> => {
  try {
    await prisma.deals.deleteMany({
      where: {
        channel_id: channelId,
      },
    });
  } catch (error) {
    const errorMessage = error as Error;
    logError(errorMessage.message);
  }
};

export const saveDeal = async (
  title: string,
  link: string,
  pubDate: string,
  category: string,
  contentSnippet: string,
  guid: string,
  isoDate: string,
  categories: string[]
): Promise<void> => {
  try {
    await prisma.deals_recorded.create({
      data: {
        title: title,
        link: link,
        pubDate: pubDate,
        content: category,
        contentSnippet: contentSnippet,
        guid: guid,
        categories: categories.join(','),
        isoDate: isoDate,
      },
    });
  } catch (error) {
    const errorMessage = error as Error;
    logError(errorMessage.message);
  }
};

export const getRecordedDeal = async (
  title: string,
  isoDate: string
): Promise<dealsRecorded | null> => {
  try {
    const deal = await prisma.deals_recorded.findFirst({
      where: {
        title: title,
        isoDate: isoDate,
      },
    });

    return deal;
  } catch (error) {
    const errorMessage = error as Error;
    logError(errorMessage.message);
  }

  return null;
};

export const getRecordedDeals = async (): Promise<dealsRecorded[]> => {
  try {
    const deals = await prisma.deals_recorded.findMany();

    return deals;
  } catch (error) {
    const errorMessage = error as Error;
    logError(errorMessage.message);
  }

  return [];
};
