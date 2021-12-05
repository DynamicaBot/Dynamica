import { GuildChannel } from "discord.js";
import { deletedPrimary } from "@/lib/operations/primary";
import { deletedSecondary } from "@/lib/operations/secondary";
import { prisma } from "@/lib/prisma";

module.exports = {
  name: "channelDelete",
  once: false,
  async execute({ id }: GuildChannel) {
    const primary = await prisma.primary.findUnique({
      where: { id },
    });
    const secondary = await prisma.secondary.findUnique({
      where: { id },
    });

    if (primary) {
      return prisma.primary.delete({
        where: { id },
        include: { aliases: true, secondaries: true },
      });
    } else if (secondary) {
      return prisma.secondary.delete({ where: { id } });
    }
  },
};
