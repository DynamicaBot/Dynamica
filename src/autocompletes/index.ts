export { general } from "./general";
export { help } from "./help";
export { join } from "./join";
export { template } from "./template";

import { AutocompleteInteraction } from "discord.js";

/**
 * The autocomplete discordjs class for ease of use.
 */
export class Autocomplete {
  /**
   * The name of the autocomplete in the API.
   */
  public name: string;

  /**
   * The response to an Autocomplete event.
   */
  public response: (interaction: AutocompleteInteraction) => Promise<void>;

  constructor() {}

  /**
   * Set the name of the autocomplete in the API.
   */
  setName(name: string) {
    this.name = name;
    return this;
  }

  /**
   * Set the response to an Autocomplete event.
   */
  setResponse(data: (interaction: AutocompleteInteraction) => Promise<void>) {
    this.response = data;
    return this;
  }
}
