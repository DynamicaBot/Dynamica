import { Embed, SlashCommandBuilder } from "@discordjs/builders";
import Cluster from "discord-hybrid-sharding";
import { Base, CommandInteraction } from "discord.js";
import { Command } from "./command";

export const info: Command = {
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
  async execute(interaction: CommandInteraction) {
    if (interaction.options.getSubcommand() === "user") {
      const user = interaction.options.getUser("target");

      if (user) {
        await interaction.reply(`Username: ${user.username}\nID: ${user.id}`);
      } else {
        await interaction.reply(
          `Your username: ${interaction.user.username}\nYour ID: ${interaction.user.id}`
        );
      }
    } else if (interaction.options.getSubcommand() === "server") {
      const client = interaction.client as Base["client"] & {
        cluster: Cluster.Client;
      };
      await interaction.reply({
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
