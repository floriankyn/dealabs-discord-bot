// Path: src/commands/Ping.ts
import {
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';

import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import puppeteer from 'puppeteer-extra';
import { Browser, executablePath } from 'puppeteer';

import {
  initDiscordMessage,
} from '../lib/utils.js';
import { EmbedBuilder } from '@discordjs/builders';

const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class ScrappingTest {
  client: Client;
  interaction: ChatInputCommandInteraction;

  constructor(client: Client, interaction: ChatInputCommandInteraction) {
    this.client = client;
    this.interaction = interaction;
  }

  public async start() {
    const InitialMessage = await initDiscordMessage(this.interaction);
    const url = this.interaction.options.getString('url', true);
    
    const image = await this.processScrapping(url); 

    try {
      if (image) {
        await this.interaction.webhook.editMessage(InitialMessage.id, {
          embeds: [
            new EmbedBuilder()
              .setTitle('Here is the test')
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

  private async processScrapping(url: string) {
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

    await page.goto(url, { waitUntil: 'networkidle2' });

    sleep(5000)

    const image = await page.screenshot();

    await browser.close();

    return image;
  }
}

export default {
  name: 'scrapping-test',
  command: new SlashCommandBuilder()
    .setName('scrapping-test')
    .setDescription('Replies with Pong!')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('The url to scrap')
        .setRequired(true)
    ),
  run: async (client: Client, interaction: ChatInputCommandInteraction) => {
    await new ScrappingTest(client, interaction).start();
  },
};
