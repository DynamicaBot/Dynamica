import prismaClient from '@prisma/client';

const { PrismaClient } = prismaClient;
/**
 * Prisma Client from Prisma
 */

const db = new PrismaClient();
export default db;
