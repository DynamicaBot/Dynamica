import { Service } from 'typedi';
import DB from '@/services/DB';
import Logger from '@/services/Logger';
import MQTT from '../services/MQTT';

@Service()
export default class Aliases {
  constructor(private mqtt: MQTT, private db: DB, private logger: Logger) {}

  /**
   * Delete an alias
   * @param activity The activity to delete an alias for
   * @param guildId The guild ID
   */
  public async remove(activity: string, guildId: string) {
    await this.db.alias.delete({
      where: { guildId_activity: { activity, guildId } },
    });
    if (this.mqtt) {
      this.mqtt.publish('dynamica/aliases', (await this.count).toString());
    }
  }

  /**
   * Get an alias
   * @param activity The activity to get an alias for
   * @param guildId The guild ID
   * @returns The database entry
   * @returns null if no alias exists
   */
  public async get(activity: string, guildId: string) {
    const dbEntry = await this.db.alias.findUnique({
      where: { guildId_activity: { activity, guildId } },
    });
    if (!dbEntry) {
      return null;
    }
    return dbEntry;
  }

  public async getByGuild(guildId: string) {
    const dbEntries = await this.db.alias.findMany({
      where: { guildId },
    });
    return dbEntries;
  }

  /**
   * Get the count of aliases
   */
  get count() {
    return this.db.alias.count();
  }

  /**
   * Create a new guild-specific alias
   * @param guildId The guild ID
   * @param activity The activity to create an alias for
   * @param alias The alias to create
   * @returns The database entry
   */
  public async create(guildId: string, activity: string, alias: string) {
    const newAlias = await this.db.alias.create({
      data: {
        guild: {
          connectOrCreate: {
            create: {
              id: guildId,
            },
            where: {
              id: guildId,
            },
          },
        },
        activity,
        alias,
      },
    });

    return newAlias;
  }

  /**
   * Update an existing alias
   * @param activity The activity to update an alias for
   * @param guildId The guild ID
   * @param updatedAlias The alias to replace the existing one with
   * @returns The database entry
   */
  public async update(activity: string, guildId: string, updatedAlias: string) {
    const dbAlias = await this.db.alias.update({
      where: { guildId_activity: { activity, guildId } },
      data: {
        alias: updatedAlias,
      },
    });
    return dbAlias;
  }
}
