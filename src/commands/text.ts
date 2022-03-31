import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../classes/command.js";
import { checkAdminPermissions } from "../utils/conditions/admin.js";
import { checkManager } from "../utils/conditions/index.js";
import { db } from "../utils/db.js";

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
    const guild = await db.guild.update({
      where: { id: interaction.guildId },
      data: { textChannelsEnabled: state },
    });

    await interaction.reply(
      `Temporary text channels ${
        guild.textChannelsEnabled ? "enabled" : "disabled"
      } for all future created channels.`
    );
  });
