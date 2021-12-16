import { db } from "@db";

/**
 * Check to see if a guild exists in the database. If it doesn't, create it.
 * @param id Guild ID
 * @returns Blank Promise
 */
export default async function checkGuild(id?: string) {
  if (!id) return;
  const guildConfig = await db.guild.findUnique({ where: { id } });
  if (!guildConfig) {
    await db.guild.create({
      data: {
        id,
      },
    });
  }
}
