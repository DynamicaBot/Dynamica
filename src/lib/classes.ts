import { Client } from "discord.js";
import { container } from "tsyringe";
import { getChannel } from "./getCached";
import { db } from "./prisma";

export class Primary {
  /**
   * Id of the primary channel
   */
  id: any;
  constructor(id) {
    this.id = id;
  }
  /**
   * Checks to see if channel exists in db
   * @returns boolean
   */
  async isValid() {
    return !!(await db.primary.findUnique({ where: { id: this.id } }));
  }
  /**
   * Gets the discord channel.
   * @returns DiscordJS channel
   */
  async discordChannel() {
    const client = container.resolve<Client<true>>(Client);
    return getChannel(client.channels, this.id);
  }
  /**
   * Gets channel configuration from database.
   * @returns config
   */
  async config() {
    return db.primary.findUnique({ where: { id: this.id } });
  }
}

export class Secondary {
  id: any;
  constructor(id) {
    this.id = id;
  }

  /**
   * Checks to see if channel exists in db
   * @returns boolean
   */
  async isValid() {
    return !!(await db.secondary.findUnique({ where: { id: this.id } }));
  }

  /**
   * Gets the discord channel.
   * @returns DiscordJS channel
   */
  async discordChannel() {
    const client = container.resolve<Client<true>>(Client);
    return getChannel(client.channels, this.id);
  }

  /**
   * Gets channel configuration from database.
   * @returns config
   */
  async config() {
    return db.secondary.findUnique({ where: { id: this.id } });
  }
}
