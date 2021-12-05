import { Embed, SlashCommandBuilder } from "@discordjs/builders";
import { APIEmbedField } from "discord-api-types";
import { CommandInteraction } from "discord.js";

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
    const commands = process.env.GUILD_ID
      ? await interaction.guild?.commands.fetch()
      : await interaction.client.application?.commands.fetch();

    const subcommandList = commands
      ? commands
          ?.find((command) => command.name === subcommand)
          ?.options.map((option) => ({
            name: option.name,
            value: option.description,
          }))
      : [];
    const commandList = commands
      ? commands?.map((command) => ({
          name: command.name,
          value: command.description,
        }))
      : [];
    const list = !subcommand
      ? commandList
      : subcommandList
      ? subcommandList
      : [];
    // console.log(commands?.map((command) => command.options));
    if (!commandList) {
      await interaction.reply("Commands unavailable.");
    } else {
      await interaction.reply({
        embeds: [new Embed().setDescription("Command List").addFields(...list)],
      });
    }
  },
};
