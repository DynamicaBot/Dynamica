import {
  CommandInteraction,
  MessageActionRow,
  MessageSelectMenu,
} from "discord.js";

import { SlashCommandBuilder } from "@discordjs/builders";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("test command"),
  async execute(interaction: CommandInteraction) {
    // await interaction.reply({
    //   content: `Test`,
    //   ephemeral: true,
    // });
    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("config")
        .setPlaceholder("")
        .setOptions([
          {
            description: "test",
            label: "test",
            value: "test",
          },
          {
            description: "not test",
            label: "not test",
            value: "not test",
          },
        ])
    );
    interaction.reply({ components: [row], content: `Message need content` });
  },
};
