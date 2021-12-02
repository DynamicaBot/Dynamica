import { SelectMenuInteraction } from "discord.js";

module.exports = {
  customId: "config",
  async execute(interaction: SelectMenuInteraction) {
    await interaction.deferReply();
    await interaction.editReply({ content: `Someone selected something!` });
  },
};
