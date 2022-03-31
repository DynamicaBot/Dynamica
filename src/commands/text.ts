import Command from "@classes/command";
import DynamicaGuild from "@classes/guild";
import { SlashCommandBuilder } from "@discordjs/builders";
import { checkManager } from "@preconditions";
import { checkAdminPermissions } from "@preconditions/admin";

export const text = new Command()
  .setPreconditions([checkManager, checkAdminPermissions])
  .setHelpText(
    "Enable or Disable private text channels that can only be accessed by people in the same voice channel."
  )
  .setCommandData(
    new SlashCommandBuilder()
      .setName("text")
      .setDescription("Enable or disable temporary text channels")
      .addBooleanOption((option) =>
        option
          .setName("state")
          .setDescription(
            "Set to true to enable text channels. Set to false to disable them."
          )
          .setRequired(true)
      )
  )
  .setResponse(async (interaction) => {
    const state = interaction.options.getBoolean("state", true);
    const guild = await new DynamicaGuild(
      interaction.client,
      interaction.guildId
    ).fetch();
    guild.setAllowJoin(state);

    await interaction.reply(
      `Temporary text channels ${
        guild.prisma.textChannelsEnabled ? "enabled" : "disabled"
      } for all future created channels.`
    );
  });
