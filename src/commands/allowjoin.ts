import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../classes/command.js";
import { checkAdminPermissions } from "../utils/conditions/admin.js";
import { checkManager } from "../utils/conditions/index.js";
import { db } from "../utils/db.js";

export const allowjoin = new Command()
  .setPreconditions([checkManager, checkAdminPermissions])
  .setCommandData(
    new SlashCommandBuilder()
      .setName("allowjoin")
      .setDescription("Allow users to request to join a locked channel.")
      .addBooleanOption((option) =>
        option
          .setName("state")
          .setDescription("Whether to enable or disable join requests.")
          .setRequired(true)
      )
  )
  .setHelpText(
    "Toggles whether or not members of your sever are allowed to request to join private channels."
  )
  .setResponse(async (interaction) => {
    const state = interaction.options.getBoolean("state", true);
    db.guild.update({
      where: { id: interaction.guild.id },
      data: {
        allowJoinRequests: state,
      },
    });
    return interaction.reply(`${state ? "Enabled" : "Disabled"} Join Requests`);
  });
