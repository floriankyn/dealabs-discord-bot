import {
  EmbedBuilder,
  ColorResolvable,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedFooterOptions,
  APIEmbedField
} from 'discord.js';

import { MessageModel } from '../types/model';

export const proxyMenu = (
  proxyInUse: number,
  proxyFailed: number,
  totalProxy: number,
  Bandwidth: number,
  messageId: string,
): MessageModel => {

  const description = `This is the proxy menu for the bot. You can list, add or remove proxies.`;

  const embedColor: ColorResolvable = 'Blue';

  const embedFooter: EmbedFooterOptions = {
    text: 'Dealabs',
  };

  const embedFields: APIEmbedField[] = [
    {
      name: 'Proxy in use',
      value: `> ${proxyInUse} proxies`,
      inline: true
    },

    {
      name: "Proxy failed",
      value: `> ${proxyFailed} proxies`,
      inline: true
    },
    {
      name: "Total Proxies",
      value: "> " + totalProxy + " proxies",
      inline: true
    },
    {
      name: "Bandwidth",
      value: "> " + Bandwidth + "Mb",
      inline: true
    },
    {
      name: "\u200b",
      value: "\u200b",
      inline: true
    },
  ]

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle('Proxy Menu')
    .addFields(embedFields)
    .setDescription(description)
    .setFooter(embedFooter);

  const actionRow = new ActionRowBuilder<ButtonBuilder>()

  const ListProxies = new ButtonBuilder()
    .setCustomId(`list_proxy_${messageId}`)
    .setLabel('List Proxies')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('📝')


  const AddProxy = new ButtonBuilder()
    .setCustomId(`add_proxy_${messageId}`)
    .setLabel('Add Proxy')
    .setStyle(ButtonStyle.Success)
    .setEmoji('➕')

  const RemoveProxy = new ButtonBuilder()
    .setCustomId(`remove_proxy_${messageId}`)
    .setLabel('Remove Proxy')
    .setStyle(ButtonStyle.Danger)
    .setEmoji('❌')

  actionRow.addComponents(ListProxies, AddProxy, RemoveProxy);

  return {
    embeds: [embed],
    components: [actionRow],
    files: [],
    content: '',
  };
}