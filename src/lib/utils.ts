import {
  InteractionResponse,
  ChatInputCommandInteraction,
  ButtonInteraction,
} from 'discord.js';
import { logError } from './logger.js';

export const initDiscordMessage = (
  interaction: ChatInputCommandInteraction,
  ephemeral: boolean = true,
  fetchReply: boolean = true
): Promise<InteractionResponse> => {
  return interaction.deferReply({
    ephemeral: ephemeral,
    fetchReply: fetchReply,
  });
};

export const handleError = async (
  error: Error,
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  followUp: boolean = false
): Promise<void> => {
  const errorMessage = error.message;

  if (followUp) {
    await interaction
      .followUp({
        content: `> ⛔️ ${errorMessage}`,
        ephemeral: true,
      })
      .then(() => logError(error.message))
      .catch((e) => logError(e.message));
  } else {
    await interaction
      .editReply({
        content: `> ⛔️ ${errorMessage}`,
      })
      .then(() => logError(error.message))
      .catch((e) => logError(e.message));
  }
};

export const isSlug = (str: string): boolean => {
  const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return slugRegex.test(str);
};

export const serializeToSlug = (str: string): string => {
  if (isSlug(str)) {
    return str;
  }

  return str
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
