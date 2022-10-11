import prismaClient from '@prisma/client';
import { Service } from 'typedi';

const { PrismaClient } = prismaClient;
/**
 * Prisma Client from Prisma
 */
@Service()
export default class DB extends PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    super();
  }
}
