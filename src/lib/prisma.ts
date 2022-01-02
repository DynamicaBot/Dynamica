import Prisma from "@prisma/client";
const { PrismaClient } = Prisma;
/**
 * Prisma Client from Prisma
 */
export const db = new PrismaClient();
