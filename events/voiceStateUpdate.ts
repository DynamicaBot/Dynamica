import { VoiceState } from "discord.js";
import { prisma } from "../lib/prisma";

module.exports = {
  name: "voiceStateUpdate",
  once: false,
  async execute(oldVoiceState: VoiceState, newVoiceState: VoiceState) {
    // If the channel doesn't change then just ignore it.
    if (oldVoiceState.channelId !== newVoiceState.channelId) {
      /**
       * Check Database for primary channel
       * @param channelId Discord Channel Id
       */
      const matchingrimaryChannel = async (channelId: string | null) =>
        channelId
          ? await prisma.primaryChannel.findUnique({
              where: {
                channelId,
              },
            })
          : undefined;

      /**
       * Check Database for subchannel
       * @param channelId Discord Channel Id
       */
      const matchingSubchannel = async (channelId: string | null) =>
        channelId
          ? await prisma.subchannel.findUnique({
              where: {
                channelId,
              },
            })
          : undefined;

      // User leaves primary
      if (await matchingrimaryChannel(oldVoiceState.channelId)) {
        // Event will be ignored most of the time as user should be automagically moved.
        console.log("user left primary");
      }

      // User joins primary
      if (
        (await matchingrimaryChannel(newVoiceState.channelId)) &&
        newVoiceState.channelId
      ) {
        // Trigger move event and create new subchannel.
        console.log("user joined primary");
        const channelConfig = await prisma.primaryChannel.findUnique({
          where: {
            channelId: newVoiceState.channelId,
          },
        });
        if (channelConfig) {
          const newSubchannel = await newVoiceState.guild.channels.create(
            channelConfig?.general_name,
            {
              type: "GUILD_VOICE",
            }
          );
          await newVoiceState.member?.voice.setChannel(newSubchannel);
          await prisma.subchannel.create({
            data: {
              primaryChannelId: channelConfig.channelId,
              channelId: newSubchannel.id,
            },
          });
        }
      }

      // Joined Subchannel
      if (
        (await matchingSubchannel(newVoiceState.channelId)) &&
        newVoiceState.channelId
      ) {
        console.log("joined subchannel");
      }

      // User leaves subchannel
      if (
        (await matchingSubchannel(oldVoiceState.channelId)) &&
        oldVoiceState.channelId
      ) {
        const channel = await oldVoiceState.guild.channels.fetch(
          oldVoiceState.channelId
        );
        if (channel?.members.size === 0) {
          // Delete Channel from db and server
          await Promise.all([
            channel.delete(),
            prisma.subchannel.delete({
              where: {
                channelId: oldVoiceState.channelId,
              },
            }),
          ]);
        }
      }
    }
  },
};
