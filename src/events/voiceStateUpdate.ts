import { VoiceState } from "discord.js";
import Event from "../classes/event.js";
import DynamicaPrimary from "../classes/primary.js";
import DynamicaSecondary from "../classes/secondary.js";

export const voiceStateUpdate = new Event()
  .setOnce(false)
  .setEvent("voiceStateUpdate")
  .setResponse(async (oldVoiceState: VoiceState, newVoiceState: VoiceState) => {
    if (oldVoiceState?.channelId === newVoiceState?.channelId) return;
    // If the channel doesn't change then just ignore it.

    // User joins channel
    if (newVoiceState.channel && newVoiceState.member) {
      /** Look for an existing secondary channel */
      const existingSecondary = await new DynamicaSecondary(
        newVoiceState.client
      ).fetch(newVoiceState.channelId);

      /** Look for an existing primary channel */
      const primary = await new DynamicaPrimary(newVoiceState.client).fetch(
        newVoiceState.channelId
      );

      // Create a new secondary if one doesn't already exist and the user has joined a primary channel
      if (!!primary) {
        const newSecondary = new DynamicaSecondary(newVoiceState.client);
        await newSecondary.create(
          primary,
          newVoiceState.guild,
          newVoiceState.member
        );
      } else if (!!existingSecondary) {
        // If a secondary exists then attempt to update the name;
        if (newVoiceState.channel.members.size !== 1) {
          await existingSecondary.update();
          if (!!existingSecondary.textChannel) {
            // Typeguard voice remove permission for people who have left the voice channel to see the text channel.
            existingSecondary.textChannel.permissionOverwrites.create(
              oldVoiceState.member.id,
              {
                VIEW_CHANNEL: true,
              }
            );
          }
        }
      }
    }

    // User leaves channel
    if (oldVoiceState.channel && oldVoiceState.member) {
      const secondary = await new DynamicaSecondary(oldVoiceState.client).fetch(
        oldVoiceState.channelId
      );

      if (!!secondary) {
        if (oldVoiceState.channel.members.size !== 0) {
          await secondary.update();
          if (!!secondary.textChannel) {
            secondary.textChannel.permissionOverwrites.delete(
              oldVoiceState.member?.id
            );
          }
        } else {
          // const debouncedDelete = pDebounce(secondary.delete, 1000);
          // await debouncedDelete();
          secondary.delete();
        }
      }
    }

    // // User joins secondary channel
    // if (newVoiceState.channel && newVoiceState.member) {
    //   const secondaryConfig = await db.secondary.findUnique({
    //     where: { id: newVoiceState.channelId },
    //     include: { guild: true },
    //   });
    //   if (secondaryConfig) {
    //     if (
    //       secondaryConfig?.guild.textChannelsEnabled &&
    //       secondaryConfig.textChannelId
    //     ) {
    //       const textChannel = await getChannel(
    //         newVoiceState.guild.channels,
    //         secondaryConfig.textChannelId
    //       );
    //       if (textChannel.type === "GUILD_TEXT") {
    //         textChannel.permissionOverwrites.create(newVoiceState.member?.id, {
    //           VIEW_CHANNEL: true,
    //         });
    //       }
    //     }
    //   }
    // }
  });
