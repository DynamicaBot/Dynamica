import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";
import { checkManager, checkSecondary } from "../utils/conditions";
import { db } from "../utils/db";
import { SuccessEmbed } from "../utils/discordEmbeds";
import { getGuildMember } from "../utils/getCached";
import { logger } from "../utils/logger";

export const name: Command = {
  conditions: [checkManager, checkSecondary],
  data: new SlashCommandBuilder()
    .setName("name")
    .setDescription("Edit the name of the current channel.")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The new name of the channel (can be a template).")
        .setRequired(true)
    ),
  helpText: {
    short: "Changes the name of the Secondary channel you're currently in.",
  },
  async execute(interaction) {
    const name = interaction.options.getString("name");

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const channel = guildMember?.voice.channel;

    db.secondary.update({ where: { id: channel.id }, data: { name } });
    logger.info(`${channel.id} name changed.`);
    return interaction.reply({
      embeds: [
        SuccessEmbed(
          `Channel name changed to ${name}. Channel may take up to 5 minutes to update.`
        ),
      ],
    });
  },
};
