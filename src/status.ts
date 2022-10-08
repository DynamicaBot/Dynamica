import { MQTT } from './classes/MQTT';
import db from './utils/db';

export default async function status() {
  const mqtt = MQTT.getInstance();
  const aliasCount = await db.alias.count();
  const secondaryCount = await db.secondary.count();
  const primaryCount = await db.primary.count();
  const guildCount = await db.guild.count();
  return {
    aliasCount,
    secondaryCount,
    primaryCount,
    guildCount,
  };
}
