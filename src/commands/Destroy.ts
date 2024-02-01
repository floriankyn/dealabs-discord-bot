// Path: src/commands/Destroy.ts
import {
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionsBitField,
  TextChannel,
  InteractionResponse,
} from 'discord.js';

import { initDiscordMessage, handleError } from '../lib/utils.js';

import {
  checkIfChannelListening,
  removeDealChannel,
  getDealChannel,
} from '../config/database.js';

import { logMessage } from '../lib/logger.js';

class Destroy {
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
      let channel: TextChannel | null = this.interaction.options.getChannel(
        'channel',
        false
      );

      if (channel !== null && !(channel instanceof TextChannel)) {
        throw new Error('The channel is not valid.');
      } else if (channel === null) {
        channel = this.interaction.channel as TextChannel;
      }

      const isChannelListening = await checkIfChannelListening(
        this.interaction.channelId
      );

      if (isChannelListening) {
        throw new Error('The channel is not listening for deals.');
      }

      if (!this.interaction.guild) {
        throw new Error('The guild id is not valid.');
      }

      const deal = await getDealChannel(this.interaction.channelId);

      if (deal === null) {
        throw new Error('The deal channel is not valid.');
      }

      await removeDealChannel(this.interaction.channelId);

      await this.interaction.webhook.editMessage(InitialMessage.id, {
        content: `> ❌  No longer listening for deals in the ${'`' + deal.slug + '`'} category.`,
      });

      const confirmationMessage = `> 📣 **${channel}** is no longer listening for deals in the ${'`' + deal.slug + '`'} category!`;

      await channel.send({
        content: confirmationMessage,
      });

      logMessage(
        `Channel ${channel.name} (${channel.id}) is is no longer listening for deals in the ${deal.slug} category and has been removed by ${this.interaction.user.username} (${this.interaction.user.id}) from the guild ${this.interaction.guild.name} (${this.interaction.guild.id}`
      );
    } catch (error) {
      await handleError(error as Error, this.interaction);
    }
  }
}

export default {
  name: 'destroy',
  command: new SlashCommandBuilder()
    .setName('destroy')
    .setDescription('Stops listening for deals.')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel to stop listening for deals.')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(
      new PermissionsBitField(PermissionsBitField.Flags.Administrator).bitfield
    ),
  run: async (client: Client, interaction: ChatInputCommandInteraction) => {
    await new Destroy(client, interaction).start();
  },
};
