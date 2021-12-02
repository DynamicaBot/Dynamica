import { GuildChannel } from "discord.js";
import {
  deletedPrimary,
  deletedSecondary,
  deletePrimary,
  deleteSecondary,
} from "../lib/operations";

module.exports = {
  name: "channelDelete",
  once: false,
  async execute(channel: GuildChannel) {
    deletedPrimary(channel.id);
    deletedSecondary(channel.id);
  },
};
