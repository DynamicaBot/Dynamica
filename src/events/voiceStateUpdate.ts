import { VoiceState } from "discord.js";
import { EventBuilder } from "../lib/builders";
import {
  createSecondary,
  deleteDiscordSecondary,
} from "../lib/operations/secondary";
import { db } from "../lib/prisma";

export const voiceStateUpdate = new EventBuilder()
  .setName("voiceStateUpdate")
  .setOnce(false)
  .setResponse(async (oldVoiceState: VoiceState, newVoiceState: VoiceState) => {
    if (oldVoiceState.channelId === newVoiceState.channelId) return;
    // If the channel doesn't change then just ignore it.

    // User joins channel
    if (newVoiceState.channelId && newVoiceState.member) {
      await createSecondary(
        newVoiceState.guild.channels,
        newVoiceState.channelId,
        newVoiceState.member
      );
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

      if (
        secondaryConfig?.guild.textChannelsEnabled &&
        oldVoiceState.channel?.members.size !== 0
      ) {
        newVoiceState.channel?.permissionOverwrites.create(
          oldVoiceState.member?.id,
          { VIEW_CHANNEL: false }
        );
      }
    }
    // User joins secondary channel
    if (newVoiceState.channelId && newVoiceState.member) {
      const secondaryConfig = await db.secondary.findUnique({
        where: { id: newVoiceState.channelId },
        include: { guild: true },
      });
      if (secondaryConfig?.guild.textChannelsEnabled) {
        newVoiceState.channel?.permissionOverwrites.create(
          newVoiceState.member?.id,
          { VIEW_CHANNEL: true }
        );
      }
    }
  });
