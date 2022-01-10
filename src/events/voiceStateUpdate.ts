import { VoiceState } from "discord.js";
import { Event } from "../Event";
import { bree } from "../utils/bree";
import { db } from "../utils/db";
import { getChannel } from "../utils/getCached";
import {
  createSecondary,
  deleteDiscordSecondary,
} from "../utils/operations/secondary";

export const voiceStateUpdate: Event = {
  event: "voiceStateUpdate",
  once: false,
  async execute(oldVoiceState: VoiceState, newVoiceState: VoiceState) {
    if (oldVoiceState?.channelId === newVoiceState?.channelId) return;
    // If the channel doesn't change then just ignore it.

    // User joins channel
    if (newVoiceState.channelId && newVoiceState.member) {
      await createSecondary(
        newVoiceState.guild.channels,
        newVoiceState.channelId,
        newVoiceState.member
      );
      const secondaryConfig = await db.secondary.findUnique({
        where: { id: newVoiceState.channelId },
      });
      if (secondaryConfig && !(newVoiceState.channel.members.size === 1)) {
        bree.run(newVoiceState.channelId);
      }
    }

    // User leaves subchannel
    if (
      oldVoiceState.channelId &&
      oldVoiceState.channel &&
      oldVoiceState.member
    ) {
      await deleteDiscordSecondary(oldVoiceState.channel);
      const secondaryConfig = await db.secondary.findUnique({
        where: { id: oldVoiceState.channelId },
        include: { guild: true },
      });
      if (secondaryConfig && oldVoiceState.channel?.members.size !== 0) {
        bree.run(oldVoiceState.channelId);
      }

      if (
        secondaryConfig.textChannelId &&
        oldVoiceState.channel?.members.size !== 0
      ) {
        const textChannel = await getChannel(
          newVoiceState.guild.channels,
          secondaryConfig.textChannelId
        );
        if (secondaryConfig.textChannelId && textChannel?.isVoice()) {
          textChannel.permissionOverwrites.create(oldVoiceState.member?.id, {
            VIEW_CHANNEL: false,
          });
        }
      }
    }
    // User joins secondary channel
    if (newVoiceState.channelId && newVoiceState.member) {
      const secondaryConfig = await db.secondary.findUnique({
        where: { id: newVoiceState.channelId },
        include: { guild: true },
      });
      if (secondaryConfig?.guild.textChannelsEnabled) {
        const textChannel = await getChannel(
          newVoiceState.guild.channels,
          secondaryConfig.textChannelId
        );
        if (textChannel.isVoice()) {
          textChannel?.permissionOverwrites.create(newVoiceState.member?.id, {
            VIEW_CHANNEL: true,
          });
        }
      }
    }
  },
};
