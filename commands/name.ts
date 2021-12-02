import { SlashCommandBuilder } from "@discordjs/builders";

// Set General Template
module.exports = {
  data: new SlashCommandBuilder()
    .setName("name")
    .setDescription("Edit the name of the current channel."),
  async execute() {
    console.log("blank");
  },
};
