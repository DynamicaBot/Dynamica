import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandBuilder } from "./";

export const invite = new CommandBuilder()
  .setConditions([])
  .setData(
    new SlashCommandBuilder()
      .setName("invite")
      .setDescription("Get an invite for your own server!")
  )
  .setResponse(async (interaction) => {
    interaction.reply({
      ephemeral: true,
      content: `https://dynamica.dev/invite`,
    });
  });
