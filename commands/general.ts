import { SlashCommandBuilder } from "@discordjs/builders";

// Set General Template
module.exports = {
  data: new SlashCommandBuilder()
    .setName("general")
    .setDescription("Edit the name of the default general channel."),
  async execute() {
    console.log("blank");
  },
};
