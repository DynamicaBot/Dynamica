import { CommandInteraction } from "discord.js";
import type { Signale } from "signale";
import { container } from "tsyringe";
import { kLogger } from "../../tokens.js";
import { getGuildMember } from "../getCached.js";
import { db } from "../prisma.js";
import { Check } from "./check.js";

/**
 * Checks to see if the voice channel the user is currently in is a channel that Dynamica manages.
 * @param interaction Discord Interaction
 * @returns Boolean if the secondary channel exists.
 */
export const checkSecondary: Check = async (
  interaction: CommandInteraction
) => {
  const logger = container.resolve<Signale>(kLogger);
  try {
    if (!interaction.guild?.members) return;
    const guildMember = await getGuildMember(
      interaction.guild?.members,
      interaction.user.id
    );

    const channel = guildMember?.voice.channel;
    if (!channel) return false;

    const channelConfig = await db.secondary.findUnique({
      where: {
        id: channel.id,
      },
    });
    return !!channelConfig;
  } catch (error) {
    logger.error("error in secondary check", error);
  }
};
