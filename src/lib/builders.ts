import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import {
  AutocompleteInteraction,
  ClientEvents,
  CommandInteraction,
} from "discord.js";
import { Check } from "./conditions";

export class AutocompleteBuilder {
  commandName: string;
  response: (interaction: AutocompleteInteraction) => Promise<any>;

  constructor() {}

  setCommandName(commandName) {
    this.commandName = commandName;
    return this;
  }

  setResponse(
    response: (interaction: AutocompleteInteraction) => Promise<any>
  ) {
    this.response = response;
  }

  run(interaction: AutocompleteInteraction) {
    if (!("response" in this)) {
      throw new Error("Missing response");
    }
    if (!("commandName" in this)) {
      throw new Error("Missing commandName");
    }
    const { name } = interaction.options.getFocused(true);
    if (name !== this.commandName) return;
    return this.response(interaction);
  }
}

/**
 * Command Builder for Dynamica
 */
export class CommandBuilder {
  /**
   * Conditions that need to be fulfilled. Commonly permissions checks.
   */
  conditions: Check[];
  /**
   * The structure of the command itself.
   */
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  /**
   * The main function of the command.
   */
  response: (interaction: CommandInteraction) => Promise<any>;

  constructor() {}

  setConditions(conditions: Check[]) {
    this.conditions = conditions;
    return this;
  }

  /**
   * Set the command data and config
   * @param data DiscordJS Command Builder
   * @returns builder
   */
  setData(
    data:
      | SlashCommandBuilder
      | SlashCommandSubcommandsOnlyBuilder
      | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
  ) {
    this.data = data;
    return this;
  }

  /**
   * Set the response to the command
   * @param execute The response to be executed.
   * @returns builder
   */
  setResponse(execute: (interaction: CommandInteraction) => Promise<any>) {
    this.response = execute;
    return this;
  }

  /**
   * Run the command
   * @param interaction DiscordJS Interaction
   * @returns Promise
   */
  run(interaction: CommandInteraction) {
    if (!("conditions" in this)) {
      throw new Error("Conditions is missing");
    }
    if (!("data" in this)) {
      throw new Error("Data is missing");
    }
    if (!("response" in this)) {
      throw new Error("Response is missing");
    }
    return this.response(interaction);
  }
}

export class EventBuilder {
  name: keyof ClientEvents;
  once: boolean;
  response: (...args: any) => Promise<any>;

  constructor() {}

  setName(name: keyof ClientEvents) {
    this.name = name;
    return this;
  }

  setOnce(once: boolean) {
    this.once = once;
    return this;
  }

  setResponse(response: (...args: any) => Promise<any>) {
    this.response = response;
    return this;
  }

  run(...args: any) {
    if (!("name" in this)) throw new Error("Missing name");
    if (!("once" in this)) throw new Error("Missing once");
    if (!("response" in this)) throw new Error("Missing response");
    return this.response(args);
  }
}
