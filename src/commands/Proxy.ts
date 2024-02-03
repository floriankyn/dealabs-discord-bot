// Path: src/commands/Proxy.ts
import {
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionsBitField,
  TextChannel,
  InteractionResponse,
  ButtonInteraction,
  Message,
  ComponentType,
} from 'discord.js';

import {
  initDiscordMessage,
  handleError,
  serializeToSlug,
} from '../lib/utils.js';

import {
  checkIfChannelListening,
  saveDealChannel,
} from '../config/database.js';

import axios, { AxiosError } from 'axios';

import { logMessage } from '../lib/logger.js';

import {
  proxyMenu
} from '../models/Proxy.js';

class Proxy {
  client: Client;
  interaction: ChatInputCommandInteraction;

  constructor(client: Client, interaction: ChatInputCommandInteraction) {
    this.client = client;
    this.interaction = interaction;
  }

  public async start() {
    const InitialMessage = await initDiscordMessage(this.interaction);

    try {
      await this.displayProxyMenu(InitialMessage);
    } catch (error) {
      handleError(error as Error, this.interaction);
    }
  }

  private async displayProxyMenu(initDiscordMessage: InteractionResponse) {
    const embed = proxyMenu(27, 42, 132, 21, initDiscordMessage.id);

    const menuMessage: Message = await this.interaction.webhook.editMessage(initDiscordMessage.id, embed);

    const menuFilter = (i: ButtonInteraction) => {
      if(!i.isButton()) return false;
      return  i.user.id === this.interaction.user.id;
    };

    const menuCollector = await menuMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: menuFilter,
      time: 15000,
    });

    menuCollector.on('collect', async (collected: ButtonInteraction) => {
      switch (collected.customId) {
        case `list_proxy_${initDiscordMessage.id}`:
          await this.listProxy(menuMessage, collected);
          break;
        case `add_proxy_${initDiscordMessage.id}`:
          await this.addProxy(menuMessage, collected);
          break;
        case `remove_proxy_${initDiscordMessage.id}`:
          await this.removeProxy(menuMessage, collected);
          break;
      }
    });
  }

  private async listProxy(menuMessage: Message, ButtonInteraction: ButtonInteraction) {
    logMessage('List Proxy');
  }

  private async addProxy(menuMessage: Message, ButtonInteraction: ButtonInteraction) {
    logMessage('Add Proxy');
  }

  private async removeProxy(menuMessage: Message, ButtonInteraction: ButtonInteraction) {
    logMessage('Remove Proxy');
  }
}

export default {
  name: 'proxy',
  command: new SlashCommandBuilder()
    .setName('proxy')
    .setDescription('Open the proxy menu!'),
  run: async (client: Client, interaction: ChatInputCommandInteraction) => {
    await new Proxy(client, interaction).start();
  },
};
