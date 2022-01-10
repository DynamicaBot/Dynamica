import { Embed, SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../Command";

export const info: Command = {
  conditions: [],
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Get info about a user or a server!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Info about a user")
        .addUserOption((option) =>
          option.setName("target").setDescription("The user")
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("server").setDescription("Info about the server")
    ),
  helpText: { short: "Shows the info of either a user or the current server." },
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "user") {
      const user = interaction.options.getUser("target");
      return user
        ? interaction.reply(`Username: ${user.username}\nID: ${user.id}`)
        : interaction.reply(
            `Your username: ${interaction.user.username}\nYour ID: ${interaction.user.id}`
          );
    } else if (subcommand === "server") {
      return interaction.reply({
        embeds: [
          new Embed()
            .addFields(
              {
                name: "Server Name",
                value: `${interaction.guild?.name}`,
              },
              {
                name: "Total Members",
                value: `${interaction.guild?.memberCount}`,
              }
            )
            .setColor(3447003),
        ],
      });
    }
  },
};
