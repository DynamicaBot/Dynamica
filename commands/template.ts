import { SlashCommandBuilder } from "@discordjs/builders";

// Set General Template
module.exports = {
  data: new SlashCommandBuilder()
    .setName("template")
    .setDescription("Edit the name of the template for seccondary channels."),
  async execute() {
    console.log("blank");
  },
};
