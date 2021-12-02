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
       * @param id Discord Channel Id
       */
      const matchingPrimaryChannel = async (id: string | null) =>
        id
          ? await prisma.primaryChannel.findUnique({
              where: {
                id,
              },
            })
          : undefined;

      /**
       * Check Database for subchannel
       * @param id Discord Channel Id
       */
      const matchingSecondaryChannel = async (id: string | null) =>
        id
          ? await prisma.secondary.findUnique({
              where: {
                id,
              },
            })
          : undefined;

      // User leaves primary
      if (await matchingPrimaryChannel(oldVoiceState.channelId)) {
        // Event will be ignored most of the time as user should be automagically moved.
        console.log("user left primary");
      }

      // User joins primary
      if (
        (await matchingPrimaryChannel(newVoiceState.channelId)) &&
        newVoiceState.channelId
      ) {
        // Trigger move event and create new subchannel.
        console.log("user joined primary");
        const channelConfig = await prisma.primaryChannel.findUnique({
          where: {
            id: newVoiceState.channelId,
          },
        });
        if (channelConfig) {
          const newSubchannel = await newVoiceState.guild.channels.create(
            channelConfig?.generalName || "General Placeholder Name",
            {
              type: "GUILD_VOICE",
            }
          );
          await newVoiceState.member?.voice.setChannel(newSubchannel);
          await prisma.secondary.create({
            data: {
              primaryChannelId: channelConfig.id,
              id: newSubchannel.id,
            },
          });
        }
      }

      // Joined Subchannel
      if (
        (await matchingSecondaryChannel(newVoiceState.channelId)) &&
        newVoiceState.channelId
      ) {
        console.log("joined subchannel");
      }

      // User leaves subchannel
      if (
        (await matchingSecondaryChannel(oldVoiceState.channelId)) &&
        oldVoiceState.channelId
      ) {
        const channel = await oldVoiceState.guild.channels.fetch(
          oldVoiceState.channelId
        );
        if (channel?.members.size === 0) {
          // Delete Channel from db and server
          await Promise.all([
            channel.delete(),
            prisma.secondary.delete({
              where: {
                id: oldVoiceState.channelId,
              },
            }),
          ]);
        }
      }
    }
  },
};
