import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get an invite for your own server!"),
  async execute(interaction: CommandInteraction) {
    interaction.reply({
      content: `https://discord.com/api/oauth2/authorize?client_id=916643283118198804&permissions=2415919120&scope=bot%20applications.commands`,
    });
  },
};
