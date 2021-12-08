import { Embed, hyperlink, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { getCommands } from "../lib/getCached";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "A help command that lists all commands available to users of the bot."
    )
    .addStringOption((option) =>
      option
        .setRequired(false)
        .setName("subcommand")
        .setDescription("Subcommand help")
    ),
  async execute(interaction: CommandInteraction) {
    const subcommand = interaction.options.getString("subcommand", false);

    const commands = await getCommands(
      interaction.guild?.commands,
      interaction.client.application?.commands
    );

    const subcommandList = commands
      ? commands
          ?.find((command) => command.name === subcommand)
          ?.options.map((option) => ({
            name: option.name,
            value: `${option.description} - ${hyperlink(
              `Docs - ${option.name}`,
              `https://dynamica.dev/docs/commands/${subcommand}#${option.name}`
            )}`,
          }))
      : [];
    const commandList = commands
      ? commands?.map((command) => ({
          name: command.name,
          value: `${command.description} - ${hyperlink(
            `Docs - ${command.name}`,
            `https://dynamica.dev/docs/commands/${command.name}`
          )}`,
        }))
      : [];
    const list = !subcommand
      ? commandList
      : subcommandList
      ? subcommandList
      : [];

    await interaction.reply({
      ephemeral: true,
      embeds: [
        new Embed()
          .setDescription("Command List")
          .addFields(...list)
          .setColor(3447003)
          .setTitle("Info"),
      ],
    });
  },
};
