import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../classes/command.js";
import { checkManager, checkSecondary } from "../utils/conditions/index.js";
import { db } from "../utils/db.js";
import { getGuildMember } from "../utils/getCached.js";
import { logger } from "../utils/logger.js";
import { editChannel } from "../utils/operations/secondary.js";

export const name = new Command()
  .setPreconditions([checkManager, checkSecondary])
  .setCommandData(
    new SlashCommandBuilder()
      .setName("name")
      .setDescription("Edit the name of the current channel.")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The new name of the channel (can be a template).")
          .setRequired(true)
      )
  )
  .setHelpText("Changes the name of the Secondary channel you're currently in.")
  .setResponse(async (interaction) => {
    const name = interaction.options.getString("name");

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const channel = guildMember?.voice.channel;

    db.secondary.update({ where: { id: channel.id }, data: { name } });
    logger.info(`${channel.id} name changed.`);
    editChannel({ channel });
    return interaction.reply(
      `Channel name changed to ${name}. Channel may take up to 10 minutes to update.`
    );
  });
