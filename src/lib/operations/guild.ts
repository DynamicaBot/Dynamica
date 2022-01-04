import { db } from "../prisma.js";

export const updateGuild = async (guildId: string, data: any) => {
  await db.guild.update({
    data,
    where: {
      id: guildId,
    },
  });
};
