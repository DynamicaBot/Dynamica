import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get an invite for your own server!"),
  async execute(interaction: CommandInteraction) {
    interaction.reply({
      content: `https://discord.com/api/oauth2/authorize?client_id=${interaction?.client?.application?.id}&permissions=285212688&scope=bot%20applications.commands`,
    });
  },
};
