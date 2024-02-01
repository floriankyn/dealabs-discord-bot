// Path: src/commands/Stats.ts
import {
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  InteractionResponse,
} from 'discord.js';

import { initDiscordMessage, handleError } from '../lib/utils.js';

import {
  getDealChannel,
} from '../config/database.js';

class Stats {
  client: Client;
  interaction: ChatInputCommandInteraction;

  constructor(client: Client, interaction: ChatInputCommandInteraction) {
    this.client = client;
    this.interaction = interaction;
  }

  public async start() {
    const InitialMessage: InteractionResponse = await initDiscordMessage(
      this.interaction
    );

    try {
      const deal = await getDealChannel(this.interaction.channelId);

      if (deal === null) {
        throw new Error('The channel is not listening for deals.');
      }

      await this.interaction.webhook.editMessage(InitialMessage.id, {
        content: `> This channel is listening for deals in the category \`${deal.slug}\` and was created by <@${deal.author_id}>.\n\n > It has received **${deal.deals_recorded}** deals so far`,
      });
    } catch (error) {
      await handleError(error as Error, this.interaction);
    }

  }
}

export default {
  name: 'stats',
  command: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Display stats relative to the bot.'),
  run: async (client: Client, interaction: ChatInputCommandInteraction) => {
    await new Stats(client, interaction).start();
  },
};
