import { Embed, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("about")
    .setDescription("About the bot."),
  async execute(interaction: CommandInteraction) {
    interaction.reply({
      embeds: [
        new Embed()
          .setTitle("About")
          .setAuthor({ name: "Sebastian P", url: "https://sebasptsch.dev" })
          .setImage(
            "https://github.com/sebasptsch/Dynamica/raw/master/assets/DynamicaBanner.png"
          )
          .setDescription("About the Dynamica Bot")
          .setURL("https://github.com/sebasptsch/Dynamica"),
      ],
    });
  },
};
