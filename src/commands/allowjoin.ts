import Command from "@classes/command.js";
import DynamicaGuild from "@classes/guild.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { checkManager } from "@preconditions";
import { checkAdminPermissions } from "@preconditions/admin";

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
    const guild = await new DynamicaGuild(
      interaction.client,
      interaction.guildId
    ).fetch();
    guild.setAllowJoin(state);
    return interaction.reply(`${state ? "Enabled" : "Disabled"} Join Requests`);
  });
