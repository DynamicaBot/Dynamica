import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { prisma } from "..";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cleanup")
    .setDescription("Cleanup empty voice channels.")
    .addChannelOption((option) =>
      option
        .setName("targetchannel")
        .setDescription("Select a channel managed by the bot to remove.")
        .addChannelType(2)
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const channelOption = interaction.options.getChannel("targetchannel", true);
    const prismaPrimaryChannel = await prisma.primaryChannel.findUnique({
      where: {
        channelId: channelOption.id,
      },
      include: {
        subchannels: true,
      },
    });
    if (!prismaPrimaryChannel) {
      interaction.editReply("Channel not managed by bot.");
      return;
    }

    const { subchannels } = prismaPrimaryChannel;

    await Promise.all(
      subchannels.map(async (channel) => {
        const discordChannel = await interaction.guild?.channels.fetch(
          channel.channelId
        );
        if (discordChannel?.members.size === 0) {
          return Promise.all([
            discordChannel?.delete(),
            prisma.subchannel.delete({
              where: {
                channelId: channel.channelId,
              },
            }),
          ]);
        }
      })
    );

    await interaction.editReply("Successfully Deleted empty channels.");
  },
};
