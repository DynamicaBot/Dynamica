import { Check } from ".";
import { db } from "../db";
import { getGuildMember } from "../getCached";
import { logger } from "../logger";
/**
 * Checks if a guild member is the creator of the secondary channel. (overridden by manager and admin)
 * @param interaction The interaction which to check.
 * @returns Promise Boolean if the person who triggered the interaction is the owner of the voice channel that they're in.
 */
export const checkCreator: Check = async (interaction) => {
  try {
    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const id = guildMember.voice.channelId;
    if (!id)
      return {
        success: false,
        message: "You need to be in a voice channel to use this command.",
      };
    const channelProperties = await db.secondary.findUnique({
      where: { id },
    });

    if (!channelProperties) {
      return {
        success: false,
        message:
          "You must be in a voice channel managed by the bot to use this command.",
      };
    }

    const dynamicaManager = guildMember?.roles.cache.some(
      (role) => role.name === "Dynamica Manager"
    );

    const admin = guildMember.permissions.has("ADMINISTRATOR");

    const creator = guildMember.id === channelProperties?.creator;

    if (!creator && !dynamicaManager && !admin) {
      return {
        success: false,
        message: `You must be the creator of <#${id}> to use this command.`,
      };
    } else {
      return { success: true };
    }
  } catch (error) {
    logger.error(error);
    return { success: false, message: "An error occured." };
  }
};
