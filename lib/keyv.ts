import Keyv from "keyv";
import { KeyvFile } from "keyv-file";

/**
 * Describes the format of server records (by Id)
 */
interface Record {
  /**
   * List of primary channels that exist in the server.
   */
  channels: {
    /**
     * Channel Id.
     */
    id: string;
    /**
     * List of subchannels which are dynamically allocated.
     */
    subchannels?: {
      /**
       * Subchannel Id
       */
      id: string;
      /**
       * (WIP) Subchannel Nickname
       */
      nickname?: string;
    }[];
    /**
     * (WIP) The name template for said primary channel's children.
     */
    title_template: string;
    /**
     * The person who ran the create command.
     */
    creator: string;
  }[];
  /**
   * (WIP) Aliases for game names.
   */
  aliases: {
    [key: string]: string;
  };
  /**
   * The person who invited the bot to the server.
   */
  owner: string;
}

export const db = new Keyv<Record>({
  store: new KeyvFile({ filename: `./config/config.json` }),
});
