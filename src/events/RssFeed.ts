import { Client, Events, Message } from 'discord.js';

import { logError, logMessage } from '../lib/logger.js';

import {
  getDealChannels,
  getRecordedDeals,
  saveDeal,
} from '../config/database.js';

import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import puppeteer from 'puppeteer-extra';
import { Browser, executablePath } from 'puppeteer';

import Parser from 'rss-parser';

import { newDeal } from '../models/RssFeed';

const Cache = new Map<string, { data: dealabsRssFeed[]; lastFetched: Date }>();

const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

class JobsButtons {
  client: Client;
  message: Message;
  constructor(client: Client, message: Message) {
    this.client = client;
    this.message = message;
  }

  public async run() {
    try {
      this.processRss();

      setInterval(async () => {
        this.processRss();
      }, 60000);
    } catch (error) {
      const errMessage = error as Error;
      logError(errMessage.message);
    }
  }

  private async processRss() {
    const RecordedDeals = await getRecordedDeals();
    const DealsChannels = await this.getActiveDealChannels();

    const categoryToFetch = DealsChannels.map((deal) => deal.slug);
    const uniqueCategoryToFetch = categoryToFetch.filter(
      (item, index) => categoryToFetch.indexOf(item) === index
    );

    for (const category of uniqueCategoryToFetch) {
      if (!Cache.has(category)) {
        const feed = await this.getFeed(category);
        Cache.set(category, { data: feed, lastFetched: new Date() });
        logMessage(`Fetched ${category} feed`);
      } else {
        const now = new Date();

        const lastFetched = Cache.get(category)?.lastFetched;

        if (!lastFetched) {
          logError('Last fetched date is not found');
          continue;
        }

        if (now.getTime() - lastFetched.getTime() > 1000 * 60 * 5) {
          const feed = await this.getFeed(category);
          Cache.set(category, { data: feed, lastFetched: new Date() });
          logMessage(`Fetched ${category} feed`);
        } else {
          logMessage(`Using cache for ${category} feed`);
        }
      }
    }

    for (const [category, feed] of Cache) {
      const feedData = feed.data.reverse();

      for (const deal of feedData) {
        if (
          !RecordedDeals.some(
            (fn) => fn.link === deal.link && fn.isoDate === deal.isoDate
          )
        ) {
          if (!deal.link.includes('discussions')) {
            
            if(new Date(deal.isoDate).getTime() > new Date().getTime() - 1000 * 60 * 60 * 24 * 1) { // 1 days

              logMessage(`New deal found: ${deal.title}`);
              await saveDeal(
                deal.title,
                deal.link,
                deal.pubDate,
                category,
                deal.contentSnippet,
                deal.guid,
                deal.isoDate,
                deal.categories
              );

              for (const channel of DealsChannels) {
                if (channel.slug === category) {
                  if (
                    deal.title
                      .toLowerCase()
                      .includes(channel.keyword.toLocaleLowerCase())
                  ) {
                    await sleep(3000);
                    await this.sendFeedContent(deal, channel.channel_id);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  private async getActiveDealChannels() {
    const channels = await getDealChannels();
    return channels;
  }

  private async getFeed(slug: string): Promise<dealabsRssFeed[]> {
    const url = `https://www.dealabs.com/rss/groupe/${slug}`;
    const parser = new Parser();
    const feed = await parser.parseURL(url);

    return feed.items as dealabsRssFeed[];
  }

  private async sendFeedContent(feed: dealabsRssFeed, channelId: string) {
    const channel = this.client.channels.cache.get(channelId);

    if (!channel) {
      logError('Channel not found');
      return;
    }

    if (!channel.isTextBased()) {
      logError('Channel is not text based');
      return;
    }

    const image = await this.getDealImage(feed.link);

    await channel.send(
      newDeal(feed.title, feed.link, feed.isoDate, image.toString('base64'))
    );
  }

  private async getProxy() {
    return {
      host: '',
      port: '',
      username: '',
      password: '',
    }
  }

  private async useProxy() {

  }

  private async getDealImage(url: string) {
    puppeteer.use(stealthPlugin());

    const browser: Browser = await puppeteer.launch({
      headless: 'new',
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      executablePath: executablePath()
    });

    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.screenshot({ path: 'example.png' });

    const buttonId =
      'body > div.box--contents > div.popover-portal.vue-portal-target > div > section > div > div > div > div > div > div:nth-child(2) > div.flex.flex--dir-col.flex--fromW3-dir-row.space--t-4 > button.overflow--wrap-on.flex--grow-1.flex--fromW3-grow-0.width--fromW3-ctrl-m.space--mb-3.space--fromW3-mb-0.space--fromW3-mr-2.button.button--shape-circle.button--type-primary.button--mode-brand';

    await page.waitForSelector(buttonId);

    await page.click(buttonId);

    await sleep(1000);

    await page.waitForSelector('#threadDetailPortal');
    const div = await page.$('#threadDetailPortal');

    if (!div) {
      await browser.close();
      throw new Error('Div not found');
    }

    const image = await div.screenshot();
    await browser.close();
    return image;
  }
}

export default {
  name: 'rssFeed',
  event: Events.ClientReady,
  run: async (client: Client, message: Message) => {
    await new JobsButtons(client, message).run();
  },
};
