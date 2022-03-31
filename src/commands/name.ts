import Command from "@classes/command";
import DynamicaSecondary from "@classes/secondary";
import db from "@db";
import { SlashCommandBuilder } from "@discordjs/builders";
import { checkManager, checkSecondary } from "@preconditions";
import logger from "@utils/logger";

export const name = new Command()
  .setPreconditions([checkManager, checkSecondary])
  .setCommandData(
    new SlashCommandBuilder()
      .setName("name")
      .setDescription("Edit the name of the current channel.")
      .addStringOption(option =>
        option
          .setName("name")
          .setDescription("The new name of the channel (can be a template).")
          .setRequired(true)
      )
  )
  .setHelpText("Changes the name of the Secondary channel you're currently in.")
  .setResponse(async interaction => {
    const name = interaction.options.getString("name");

    const guildMember = await interaction.guild.members.cache.get(
      interaction.user.id
    );

    const channel = guildMember?.voice.channel;

    await db.secondary.update({ where: { id: channel.id }, data: { name } });
    logger.info(`${channel.id} name changed.`);

    const secondary = await new DynamicaSecondary(
      interaction.client,
      channel.id
    ).fetch();
    secondary.update();
    return interaction.reply(`Channel name changed to \`${name}\`.`);
  });
