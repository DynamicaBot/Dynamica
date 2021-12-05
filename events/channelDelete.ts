import { GuildChannel } from "discord.js";
import { deletedPrimary } from "../lib/operations/primary";
import { deletedSecondary } from "../lib/operations/secondary";

module.exports = {
  name: "channelDelete",
  once: false,
  async execute(channel: GuildChannel) {
    deletedPrimary(channel.id);
    deletedSecondary(channel.id);
  },
};
