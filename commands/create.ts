import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { db } from "../lib/keyv";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("Create a primary channel."),
  async execute(interaction: CommandInteraction) {
    if (!interaction.memberPermissions?.has("MANAGE_CHANNELS"))
      interaction.reply("User requires manage channel permissions.");

    interaction.guild?.channels
      .create("Primary Channel", { type: "GUILD_VOICE" })
      .then(async (channel) => {
        const existingConfig = await db.get(interaction.guildId);

        existingConfig?.channels.push({ id: channel.id, subchannels: {} });
      });
  },
};
