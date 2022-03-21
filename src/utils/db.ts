import prismaClient from ".prisma/client";
const { PrismaClient } = prismaClient;
/**
 * Prisma Client from Prisma
 */
export const db = new PrismaClient();
