import Client from '@/services/Client';
import DB from '@/services/DB';
import Logger from '@/services/Logger';
// eslint-disable-next-line import/no-cycle
import updatePresence from '@/utils/presence';
import { Container, Service } from 'typedi';
// eslint-disable-next-line import/no-cycle
import Primaries from './Primaries';
// eslint-disable-next-line import/no-cycle
// eslint-disable-next-line import/no-cycle
import Secondaries from './Secondaries';

@Service()
export default class DynamicaPrimary {
  constructor(
    public id: string,
    private guildId: string,
    private db: DB,
    private client: Client,
    private secondaries: Secondaries,
    private logger: Logger,
    private primaries: Primaries
  ) {}

  /**
   * Delete a primary discord channel. DB & Discord Channel.
   */
  async delete(deleteDiscord: boolean = true): Promise<void> {
    const result = await Promise.allSettled([
      deleteDiscord ? this.deleteDiscord() : Promise.resolve(),
    ]);

    if (result[0].status === 'rejected') {
      this.logger
        .scope('Primary', this.id)
        .error('Failed to delete discord:', result[0].reason);
    }

    const primaries = Container.get(Primaries);
    await primaries.remove(this.id);
    updatePresence();
  }

  prisma() {
    return this.db.primary.findUniqueOrThrow({
      where: { id: this.id },
      include: { secondaries: true },
    });
  }

  async deleteDiscord() {
    const channel = await this.discord();
    if (!channel.deletable) {
      throw new Error('Channel is not deletable');
    }
    return channel.delete();
  }

  async discord() {
    const channel = await this.client.channels.fetch(this.id);
    if (!channel.isVoiceBased()) {
      throw new Error('Not a voice channel');
    }
    return channel;
  }

  async update() {
    const channel = await this.discord();
    if (!channel.manageable) {
      throw new Error('Not manageable');
    }
    const { members } = channel;
    if (members.size) {
      const primaryMember = members.at(0);
      const secondary = await this.secondaries.initalise(
        channel,
        primaryMember
      );
      const others = [...members.values()].slice(1);
      await Promise.all(
        others.map(async (member) => {
          await secondary.addMember(member);
        })
      );
    }
  }

  toString() {
    return `<Primary: ${this.id}>`;
  }
}
