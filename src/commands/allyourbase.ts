import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from ".";
import { checkManager, checkSecondary } from "../utils/conditions";
import { db } from "../utils/db";
import { getGuildMember } from "../utils/getCached";

export const allyourbase = new Command()
  .setPreconditions([checkManager, checkSecondary])
  .setHelpText(
    "Transfers the ownership of the current channel to the person who ran the command. (Must be an admin)"
  )
  .setCommandData(
    new SlashCommandBuilder()
      .setName("allyourbase")
      .setDescription(
        "If you are an admin you become the owner of the channel you are in."
      )
  )
  .setResponse(async (interaction) => {
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
  });
