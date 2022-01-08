import { db } from "../prisma";

export const updateGuild = async (guildId: string, data: any) => {
  await db.guild.update({
    data,
    where: {
      id: guildId,
    },
  });
};
