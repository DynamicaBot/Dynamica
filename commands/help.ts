import { Embed, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "A help command that lists all commands available to users of the bot."
    ),
  async execute(interaction: CommandInteraction) {
    const commands = await interaction.client.application?.commands.fetch();
    const commandList = commands?.map((command) => ({
      name: command.name,
      value: command.description,
    }));
    if (!commandList) {
      await interaction.reply("Commands unavailable.");
    } else {
      await interaction.reply({
        embeds: [
          new Embed().setDescription("Command List").addFields(...commandList),
        ],
      });
    }
  },
};
