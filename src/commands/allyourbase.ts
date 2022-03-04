import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Command } from "../Command";
import { checkManager, checkSecondary } from "../utils/conditions";
import { db } from "../utils/db";
import { getGuildMember } from "../utils/getCached";

export const allyourbase: Command = {
  conditions: [checkManager, checkSecondary],
  data: new SlashCommandBuilder()
    .setName("allyourbase")
    .setDescription(
      "If you are an admin you become the owner of the channel you are in."
    ),
  helpText: {
    short:
      "Transfers the ownership of the current channel to the person who ran the command. (Must be an admin)",
  },
  async execute(interaction: CommandInteraction): Promise<void> {
    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const channel = guildMember?.voice.channel;

    if (!channel) return;

    db.secondary.update({
      where: { id: channel.id },
      data: { creator: interaction.user.id },
    });

    interaction.reply(
      `Owner of <#${channel.id}> changed to <@${guildMember.user.id}>`
    );
  },
};
