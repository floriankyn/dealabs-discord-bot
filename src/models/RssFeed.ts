import {
  EmbedBuilder,
  ColorResolvable,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedFooterOptions,
  AttachmentBuilder,
} from 'discord.js';

import { MessageModel } from '../types/model';

export const newDeal = (
  title: string,
  link: string,
  isoDate: string,
  base64Image: string
): MessageModel => {
  const embedColor: ColorResolvable = 'Blue';

  const embedFooter: EmbedFooterOptions = {
    text: 'Dealabs',
  };

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(title)
    .setURL(link)
    .setFooter(embedFooter)
    .setTimestamp(new Date(isoDate))
    .setImage('attachment://deal.png');

  const file = new AttachmentBuilder(Buffer.from(base64Image, 'base64'), {
    name: 'deal.png',
  });

  const actionRow = new ActionRowBuilder<ButtonBuilder>();

  const applyButton = new ButtonBuilder()
    .setCustomId(`insight`)
    .setLabel('Insights')
    .setStyle(ButtonStyle.Primary)
    .setEmoji('📝');

  actionRow.addComponents(applyButton);

  return {
    embeds: [embed],
    components: [actionRow],
    files: [file],
    content: '',
  };
};
