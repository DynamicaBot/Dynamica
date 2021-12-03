import { SelectMenuInteraction } from "discord.js";

module.exports = {
  customId: "config",
  async execute(interaction: SelectMenuInteraction) {
    // await interaction.deferReply();
    await interaction.reply({ content: `Someone selected something!` });
  },
};
