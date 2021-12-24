import { CommandInteraction } from "discord.js";
import { db } from "../prisma";
import { Check } from "./check";

/**
 * Check to see if a guild exists in the database. If it doesn't, create it.
 * @param interaction Interaction
 * @returns Promise Boolean
 */
export const checkGuild: Check = async (interaction: CommandInteraction) => {
  if (!interaction.guild.id) return true;
  const { id } = interaction.guild;
  const guildConfig = await db.guild.findUnique({ where: { id } });
  if (!guildConfig) {
    await db.guild.create({
      data: {
        id,
      },
    });
  }
  return true;
};
