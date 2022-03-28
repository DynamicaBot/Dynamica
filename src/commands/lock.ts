import { SlashCommandBuilder } from "@discordjs/builders";
import Command from "../classes/command.js";
import DynamicaSecondary from "../classes/secondary.js";
import { checkAdminPermissions } from "../utils/conditions/admin.js";
import { checkCreator, checkSecondary } from "../utils/conditions/index.js";
import { getGuildMember } from "../utils/getCached.js";

export const lock = new Command()
  .setPreconditions([checkCreator, checkSecondary, checkAdminPermissions])
  .setCommandData(
    new SlashCommandBuilder()
      .setName("lock")
      .setDescription("Lock a channel to a certain role or user.")
  )
  .setHelpText(
    "Use it to lock your channels away from pesky server members.",
    "Use it to lock your channels away from pesky server members. Locks it to the creator (initially) and permissions can be altered with /permission. \n Channels can be reset to default with /unlock."
  )
  .setResponse(async (interaction) => {
    if (!interaction.guild?.members) return;

    const guildMember = await getGuildMember(
      interaction.guild.members,
      interaction.user.id
    );

    const channelId = guildMember?.voice.channelId;

    const dynamicaSecondary = await new DynamicaSecondary(
      interaction.client
    ).fetch(channelId);

    if (dynamicaSecondary) {
      await dynamicaSecondary.lock();
      await interaction.reply({
        ephemeral: true,
        content: `Use \`/permission add\` to allow people to access the channels. Or, \`/permission remove\` to remove people.`,
      });
    } else {
      await interaction.reply({
        ephemeral: true,
        content: `This isn't a dynamica channel.`,
      });
    }
  });
