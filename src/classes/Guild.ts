import Client from '@/services/Client';
import DB from '@/services/DB';
import Logger from '@/services/Logger';
import { Container, Service } from 'typedi';
// eslint-disable-next-line import/no-cycle
import GuildFactory from './GuildFactory';
// eslint-disable-next-line import/no-cycle
import Guilds from './Guilds';

@Service({ factory: [GuildFactory, 'create'] })
export default class DynamicaGuild {
  public id: string;

  constructor(id: string, private db: DB, private client: Client) {
    this.id = id;
  }

  prisma() {
    return this.db.guild.findUniqueOrThrow({
      where: { id: this.id },
    });
  }

  discord() {
    return this.client.guilds.fetch(this.id);
  }

  async leaveDiscord() {
    const guild = await this.discord();
    return guild.leave();
  }

  async leave(leaveDiscord: boolean = true) {
    const logger = Container.get(Logger);
    const guilds = Container.get(Guilds);

    const result = await Promise.allSettled([
      leaveDiscord ? this.leaveDiscord() : Promise.resolve(),
    ]);

    if (result[0].status === 'rejected') {
      logger.error('Failed to leave guild:', result[0].reason);
    }

    guilds.remove(this.id);
  }

  /**
   * Change the setting allowing people to request to join a locked channel.
   * @param enabled the state to set the setting to
   * @returns this
   */
  async setAllowJoin(enabled: boolean) {
    await this.db.guild.update({
      where: { id: this.id },
      data: {
        allowJoinRequests: enabled,
      },
    });
  }
}
