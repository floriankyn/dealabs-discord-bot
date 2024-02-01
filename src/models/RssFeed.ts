import {
  EmbedBuilder,
  ColorResolvable,
  EmbedFooterOptions,
  AttachmentBuilder
} from 'discord.js';

import { MessageModel } from '../types/model';

export const newDeal = (
  title: string,
  link: string,
  isoDate: string,
  base64Image: string,
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

  return {
    embeds: [embed],
    components: [],
    files: [file],
    content: '',
  };
};
