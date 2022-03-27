import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../classes/command.js";
import { checkAdminPermissions } from "../utils/conditions/admin.js";
import { checkManager } from "../utils/conditions/index.js";
import { updateGuild } from "../utils/operations/guild.js";

export const text = new Command()
  .setPreconditions([checkManager, checkAdminPermissions])
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

    updateGuild(interaction.guildId, { textChannelsEnabled: state });

    return interaction.reply(
      `Temporary text channels ${
        !state ? "disabled" : "enabled"
      } for all future created channels.`
    );
  });
