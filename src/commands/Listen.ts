// Path: src/commands/Listen.ts
import {
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionsBitField,
  TextChannel,
  InteractionResponse
} from 'discord.js';

import {
  initDiscordMessage,
  handleError,
  serializeToSlug,
} from '../lib/utils.js';

import {
  checkIfChannelListening,
  saveDealChannel
} from '../config/database.js';

import axios, { AxiosError } from "axios"

import { logMessage } from '../lib/logger.js';

class Listen {
  client: Client;
  interaction: ChatInputCommandInteraction;

  constructor(client: Client, interaction: ChatInputCommandInteraction) {
    this.client = client;
    this.interaction = interaction;
  }

  public async start() {
    const InitialMessage: InteractionResponse = await initDiscordMessage(this.interaction);

    try {
      const category = this.interaction.options.getString('category', true);
      const slug = serializeToSlug(category);

      const isChannelListening = await checkIfChannelListening(this.interaction.channelId);

      if (!isChannelListening) {
        throw new Error('The channel is already listening for deals.');
      }

      const categoryExists = await this.checkCategoryExists(slug);

      if (!categoryExists.exists) {
        if (categoryExists.code === 404) {
          throw new Error('The category does not exist.');
        } else {
          throw new Error('An error occured while checking if the category exists.');
        }
      }

      let channel: TextChannel | null = this.interaction.options.getChannel('channel', false);

      if (channel !== null && !(channel instanceof TextChannel)) {
        throw new Error('The channel is not valid.');
      } else if (channel === null) {
        channel = this.interaction.channel as TextChannel;
      }

      if (!this.interaction.guild) {
        throw new Error('The guild id is not valid.');
      }

      await saveDealChannel(this.interaction.channelId, this.interaction.guild.id, this.interaction.user.id, slug);

      await this.interaction.webhook.editMessage(InitialMessage.id, {
        content: `> ✅ Listening for deals in the ${category} category!`,
      });

      const confirmationMessage = `> 📣 **${channel}** is now listening for deals in the ${"`" + category + "`"} category!`;

      await channel.send({
        content: confirmationMessage,
      });

      logMessage(`Channel ${channel.name} (${channel.id}) is now listening for deals in the ${category} category and has been set by ${this.interaction.user.username} (${this.interaction.user.id}) on the guild ${this.interaction.guild.name} (${this.interaction.guild.id}`);
    } catch (error) {
      await handleError(error as Error, this.interaction);
    }
  }

  private async checkCategoryExists(slug: string): Promise<{ exists: boolean, code: number }> {
    const url = `https://www.dealabs.com/rss/groupe/${slug}`;

    try {
      await axios.get(url)

      return {
        exists: true,
        code: 200
      };
    } catch (error) {
      const err = error as AxiosError;

      if (err.response?.status === 404) {
        return {
          exists: false,
          code: 404
        };
      } else {
        throw new Error(err.message);
      }
    }
  }
}

export default {
  name: 'listen',
  command: new SlashCommandBuilder()
    .setName('listen')
    .setDescription('Starts listening for deals!')
    .addStringOption((option) =>
      option.setName('category')
        .setDescription('The slug category to listen for.')
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option.setName('channel')
        .setDescription('The channel to post the deals in.')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(
      new PermissionsBitField(PermissionsBitField.Flags.Administrator).bitfield
    ),
  run: async (client: Client, interaction: ChatInputCommandInteraction) => {
    await new Listen(client, interaction).start();
  },
};
