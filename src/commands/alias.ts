import { Embed, SlashCommandBuilder } from "@discordjs/builders";
import _ from "lodash";
import Command from "../classes/command.js";
import { checkManager } from "../utils/conditions/index.js";
import { db } from "../utils/db.js";
import { listAliases, updateAlias } from "../utils/operations/alias.js";

export const alias = new Command()
  .setPreconditions([checkManager])
  .setHelpText(
    "Adds an alternative name for a game that replaces the default one in the channel name.",
    `The alias command allows you to shorten the name of a game in the channel's title. This can be helpful for shortening the names of some games or, if your group has another name they refer to a game by.\n\n**add**\nThe add command adds a new alias. So if you were playing "F1 2021" /alias add "F1 2021" "F1" every time the channel name updates instead of F1 2021 F1 would appear.\n\n**remove**\nThis does exactly as you would expect, it removes an alias for a given activity. For example /alias remove "F1 2021" would remove the alias that we set before for F1 2021.\n\n**list**\nLists the aliases that you've created for the channel you are in.`
  )
  .setCommandData(
    new SlashCommandBuilder()
      .setName("alias")
      .setDescription("Manage aliases.")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("add")
          .setDescription("Add a new alias.")
          .addStringOption((option) =>
            option
              .setName("activity")
              .setRequired(true)
              .setDescription("The target activity.")
          )
          .addStringOption((option) =>
            option
              .setName("alias")
              .setDescription("The alias the game should be known by.")
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("remove")
          .setDescription("Remove an alias.")
          .addStringOption((option) =>
            option
              .setName("activity")
              .setDescription(
                "Name of the activity you want to reset the alias for."
              )
              .setRequired(true)
              .setAutocomplete(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand.setName("list").setDescription("List currently set aliases.")
      )
  )
  .setResponse(async (interaction) => {
    const subcommand = interaction.options.getSubcommand(true);
    const activity = interaction.options.getString("activity");
    switch (subcommand) {
      case "add":
        const alias = interaction.options.getString("alias", true);
        await updateAlias(activity, alias, interaction.guildId);
        await interaction.reply(
          `Successfully created alias \`${alias}\` for \`${activity}\``
        );
        break;
      case "remove":
        const deletedAlias = await db.alias.delete({
          where: { id: parseInt(activity) },
        });
        await interaction.reply(
          `Successfully removed alias for \`${deletedAlias.activity}\`.`
        );

        break;

      case "list":
        const aliases = await listAliases(interaction.guildId);
        const inlineAliases = aliases.map(({ name, value }) => ({
          name,
          value,
          inline: true,
        }));

        const embeds = _.chunk(inlineAliases, 25).map((result) =>
          new Embed().addFields(...result)
        );
        interaction.reply({
          content: `Alias List`,
          embeds,
        });
        break;

      default:
        break;
    }
  });
