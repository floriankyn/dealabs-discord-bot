// Path: src/commands/Ping.ts
import {
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ColorResolvable
} from 'discord.js';

import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import puppeteer from 'puppeteer-extra';
import { Browser, executablePath } from 'puppeteer';

import {
  initDiscordMessage,
} from '../lib/utils.js';
import { EmbedBuilder } from '@discordjs/builders';

class ScrappingInsight {
  client: Client;
  interaction: ChatInputCommandInteraction;

  constructor(client: Client, interaction: ChatInputCommandInteraction) {
    this.client = client;
    this.interaction = interaction;
  }

  public async start() {
    const InitialMessage = await initDiscordMessage(this.interaction);

    const image = await this.processScrapping();

    try {
      if (image) {
        await this.interaction.webhook.editMessage(InitialMessage.id, {
          embeds: [
            new EmbedBuilder()
              .setTitle('Here is the insight')
              .setImage('attachment://insight.png')
          ],
          files: [
            {
              attachment: image,
              name: 'insight.png',
            },
          ],
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async processScrapping() {
    puppeteer.use(stealthPlugin());

    const browser: Browser = await puppeteer.launch({
      headless: 'new',
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
      executablePath: executablePath(),
    });

    const page = await browser.newPage();

    await page.goto("https://bot.sannysoft.com/", { waitUntil: 'networkidle2' });

    const status = await page.$("body > table:nth-child(4)")

    const image = await status?.screenshot();

    await browser.close();
    return image;
  }
}

export default {
  name: 'scrapping-insight',
  command: new SlashCommandBuilder()
    .setName('scrapping-insight')
    .setDescription('Replies with Pong!'),
  run: async (client: Client, interaction: ChatInputCommandInteraction) => {
    await new ScrappingInsight(client, interaction).start();
  },
};
