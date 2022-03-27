import { CommandInteraction } from "discord.js";
import { Check } from ".";
import { db } from "../db.js";
import { getGuildMember } from "../getCached.js";
import { logger } from "../logger.js";

/**
 * Checks to see if the voice channel the user is currently in is a channel that Dynamica manages.
 * @param interaction Discord Interaction
 * @returns Boolean if the secondary channel exists.
 */
export const checkSecondary: Check = async (
  interaction: CommandInteraction
) => {
  try {
    const guildMember = await getGuildMember(
      interaction.guild?.members,
      interaction.user.id
    );

    const channel = guildMember?.voice.channel;
    if (!channel)
      return {
        success: false,
        message: "You must be in a voice channel to use this command.",
      };

    const channelConfig = await db.secondary.findUnique({
      where: {
        id: channel.id,
      },
    });
    if (!!channelConfig) {
      return { success: true };
    } else {
      return {
        success: false,
        message:
          "You need to be in a channel managed by the bot to use this command.",
      };
    }
  } catch (error) {
    logger.error("error in secondary check", error);
    return { success: false, message: "An error occured." };
  }
};
