import Keyv from "keyv";
import { KeyvFile } from "keyv-file";

/**
 * Describes the format of server records (by Id)
 */
interface Channel {
  /**
   * Channel Name set during creation
   */
  name: string;

  /**
   * Template for renaming the general channel.
   */
  general_name: string;

  /**
   * List of subchannels which are dynamically allocated.
   */
  subchannels: {
    [id: string]: {
      /**
       * (WIP) Subchannel Nickname
       */
      nickname?: string;
    };
  };
  /**
   * (WIP) The name template for said primary channel's children.
   */
  title_template?: string;
  /**
   * The person who ran the create command.
   */
  creator: string;
}

interface Guild {
  /**
   * The owner of the server.
   */
  owner: string;
}

export const channels = new Keyv<Channel>({
  store: new KeyvFile({ filename: `./config/channels.json` }),
});

export const guilds = new Keyv<Guild>({
  store: new KeyvFile({ filename: `./config/guilds.json` }),
});
