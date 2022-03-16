import { VoiceState } from "discord.js";
import pDebounce from "p-debounce";
import { Event } from ".";
import { db } from "../utils/db";
import { getChannel } from "../utils/getCached";
import { logger } from "../utils/logger";
import {
  createSecondary,
  deleteDiscordSecondary,
  editChannel,
} from "../utils/operations/secondary";

export const voiceStateUpdate = new Event()
  .setOnce(false)
  .setEvent("voiceStateUpdate")
  .setResponse(async (oldVoiceState: VoiceState, newVoiceState: VoiceState) => {
    if (oldVoiceState?.channelId === newVoiceState?.channelId) return;
    // If the channel doesn't change then just ignore it.

    // User joins channel
    if (newVoiceState.channel && newVoiceState.member) {
      const secondaryConfig = await db.secondary.findUnique({
        where: { id: newVoiceState.channelId },
      });
      const primaryConfig = await db.primary.findUnique({
        where: { id: newVoiceState.channelId },
      });
      // Create a new secondary if one doesn't already exist and the user has joined a primary channel
      if (primaryConfig) {
        createSecondary(
          newVoiceState.guild.channels,
          newVoiceState.channelId,
          newVoiceState.member
        );
      } else if (secondaryConfig) {
        // If a secondary exists then run rename job.
        if (newVoiceState.channel.members.size !== 1) {
          editChannel({ channel: newVoiceState.channel });
          if (secondaryConfig.textChannelId) {
            const textChannel = await getChannel(
              newVoiceState.guild.channels,
              secondaryConfig.textChannelId
            );

            // Typeguard voice remove permission for people who have left the voice channel to see the text channel.
            if (textChannel.type === "GUILD_TEXT") {
              textChannel.permissionOverwrites.create(
                oldVoiceState.member?.id,
                {
                  VIEW_CHANNEL: true,
                }
              );
            }
          }
        }
      }
    }

    // User leaves channel
    if (oldVoiceState.channel && oldVoiceState.member) {
      const secondaryConfig = await db.secondary.findUnique({
        where: { id: oldVoiceState.channelId },
        include: { guild: true },
      });
      if (secondaryConfig) {
        if (oldVoiceState.channel?.members.size !== 0) {
          await editChannel({ channel: oldVoiceState.channel });
          // Get discord text channel
          if (secondaryConfig.textChannelId) {
            const textChannel = await getChannel(
              newVoiceState.guild.channels,
              secondaryConfig.textChannelId
            );

            // Typeguard voice remove permission for people who have left the voice channel to see the text channel.
            if (textChannel.type === "GUILD_TEXT") {
              textChannel.permissionOverwrites.delete(oldVoiceState.member?.id);
            }
          }
        } else {
          try {
            const debouncedDelete = pDebounce(deleteDiscordSecondary, 1000);
            await debouncedDelete(oldVoiceState.channel, secondaryConfig);
          } catch (error) {
            logger.error(error);
          }
        }
      }
    }

    // User joins secondary channel
    if (newVoiceState.channelId && newVoiceState.member) {
      const secondaryConfig = await db.secondary.findUnique({
        where: { id: newVoiceState.channelId },
        include: { guild: true },
      });
      if (secondaryConfig) {
        if (
          secondaryConfig?.guild.textChannelsEnabled &&
          secondaryConfig.textChannelId
        ) {
          const textChannel = await getChannel(
            newVoiceState.guild.channels,
            secondaryConfig.textChannelId
          );
          if (textChannel.type === "GUILD_TEXT") {
            textChannel.permissionOverwrites.create(newVoiceState.member?.id, {
              VIEW_CHANNEL: true,
            });
          }
        }
      }
    }
  });
