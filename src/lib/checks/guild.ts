import { prisma } from "../prisma";
import { Guild } from "discord.js";

export default async function checkGuild(id?: string) {
  if (!id) return;
  const guildConfig = await prisma.guild.findUnique({ where: { id } });
  if (!guildConfig) {
    await prisma.guild.create({
      data: {
        id,
      },
    });
  }
}
