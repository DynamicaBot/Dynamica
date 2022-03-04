import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer, gql } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import { Client, Intents } from "discord.js";
import dotenv from "dotenv";
import * as events from "./events/index";
import { db } from "./utils/db";
import { logger } from "./utils/logger";
dotenv.config();

/**
 * Apollo
 */
var typeDefs = gql`
  type PruneResponse {
    prunedGuildsCount: Int
    prunedPrimariesCount: Int
    prunedSecondariesCount: Int
  }

  type Mutation {
    prune: PruneResponse!
  }

  type DiscordVoiceChannel {
    id: String!
    name: String!
    members: [DiscordUser!]!
  }

  type DiscordUser {
    bot: Boolean!
    id: String!
    username: String!
    tag: String!
  }

  type DiscordGuild {
    id: String!
    memberCount: Int!
    owner: DiscordUser!
    name: String!
  }

  type DBGuild {
    id: String!
    textChannelsEnabled: Boolean
    allowJoinRequests: Boolean
    dbPrimaries: [DBPrimary!]!
    dbAliases: [DBAlias!]!
    dbSecondaries: [DBSecondary!]!
    discordGuild: DiscordGuild!
  }

  type DBSecondary {
    id: String!
    name: String!
    discordChannel: DiscordVoiceChannel!
    creator: String!
    locked: Boolean!
    dbGuild: DBGuild!
    guildId: String!
    textChannelId: String!
    dbPrimary: DBPrimary!
    primaryId: String!
  }

  type DBPrimary {
    id: String!
    creator: String!
    template: String!
    generalName: String!
    discordChannel: DiscordVoiceChannel!
    dbSecondaries: [DBSecondary!]!
    dbGuild: DBGuild!
    guildId: String!
  }

  type DBAlias {
    id: Int!
    activity: String!
    alias: String!
    dbGuild: DBGuild!
    guildId: String!
  }

  type Query {
    dbSecondaries: [DBSecondary!]!
    dbSecondary(id: String!): DBSecondary!
    dbGuilds: [DBGuild!]!
    dbGuild(id: String!): DBGuild!
    dbPrimaries: [DBPrimary!]!
    dbPrimary(id: String!): DBPrimary!
    dbAliases: [DBAlias!]!
    dbAlias(id: String!): DBAlias!
    serverCount: Int!
    version: String!
    ready: Boolean!
  }
`;

const resolvers = {
  Mutation: {
    prune: async () => {
      const guilds = await db.guild.findMany();
      const secondaries = await db.secondary.findMany();
      const primary = await db.primary.findMany();
      const checkedGuilds = await Promise.all(
        guilds.map(async (guild) => {
          try {
            const dguild = await client.guilds.cache.get(guild.id);
            return !dguild;
          } catch (error) {
            logger.error(error);
          }
        })
      );
      const checkedSecondaries = await Promise.all(
        secondaries.map(async (secondary) => {
          try {
            const channel = await client.channels.cache.get(secondary.id);

            return !channel;
          } catch (error) {
            logger.error(error);
          }
        })
      );
      const checkedPrimaries = await Promise.all(
        primary.map(async (primary) => {
          try {
            const channel = await client.channels.cache.get(primary.id);

            return !channel;
          } catch (error) {
            logger.error(error);
          }
        })
      );
      return {
        prunedGuildsCount: checkedGuilds.filter((guild) => guild).length,
        prunedPrimariesCount: checkedPrimaries.filter((primary) => primary)
          .length,
        prunedSecondariesCount: checkedSecondaries.filter((primary) => primary)
          .length,
      };
    },
  },
  Query: {
    dbSecondaries: async () => await db.secondary.findMany(),
    dbSecondary: async (parent, { id }, context, info) =>
      await db.secondary.findUnique({ where: { id } }),
    dbGuilds: async () => await db.guild.findMany(),
    dbGuild: async (parent, { id }, context, info) =>
      await db.guild.findUnique({
        where: {
          id,
        },
      }),
    dbPrimaries: async () => await db.primary.findMany(),
    dbPrimary: async (parent, { id }, context, info) =>
      await db.primary.findUnique({ where: { id } }),
    dbAliases: async () => await db.alias.findMany(),
    dbAlias: async (parent, { id }, context, info) =>
      await db.alias.findUnique({ where: { id } }),
    serverCount: () => client.guilds.cache.size,
    version: () => process.env.DRONE_TAG,
    ready: () => client.isReady(),
  },
  DiscordVoiceChannel: {
    members: async (parent) => {
      const channel = await client.channels.fetch(parent.id);
      if (channel.isVoice()) {
        return channel.members.map((member) => member.user);
      }
    },
  },
  DBPrimary: {
    dbSecondaries: async (parent) =>
      await db.secondary.findMany({ where: { primaryId: parent.id } }),
    dbGuild: async (parent) =>
      await db.guild.findUnique({ where: { id: parent.guildId } }),
    discordChannel: async (parent) => await client.channels.fetch(parent.id),
  },
  DBGuild: {
    dbPrimaries: async (parent) =>
      await db.primary.findMany({ where: { guildId: parent.id } }),
    dbAliases: async (parent) =>
      await db.alias.findMany({ where: { guildId: parent.id } }),
    dbSecondaries: async (parent) =>
      await db.secondary.findMany({ where: { guildId: parent.id } }),
    discordGuild: async (parent) => await client.guilds.fetch(parent.id),
  },
  DiscordGuild: {
    owner: async (parent) =>
      (await (await client.guilds.fetch(parent.id)).fetchOwner()).user,
  },
  DBAlias: {
    dbGuild: async (parent) =>
      await db.guild.findUnique({ where: { id: parent.guildId } }),
  },
  DBSecondary: {
    dbGuild: async (parent) =>
      await db.guild.findUnique({ where: { id: parent.guildId } }),
    dbPrimary: async (parent) =>
      await db.primary.findUnique({ where: { id: parent.primaryId } }),
    discordChannel: async (parent) => await client.channels.fetch(parent.id),
  },
};
(async () => {
  const app = express()
  const httpServer = http.createServer(app)
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({httpServer})]
  })
  await server.start()
  server.applyMiddleware({
    app,
    path: '/graphql'
  })
  await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  
})

/**
 * DiscordJS Client instance
 */
export const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
});

const eventList = Object.values(events);
try {
  // Register event handlers
  for (const event of eventList) {
    if (event.once) {
      client.once(event.event, (...args) => event.execute(...args));
    } else {
      client.on(event.event, (...args) => event.execute(...args));
    }
  }

  client.login(process.env.TOKEN);
} catch (error) {
  logger.error(error);
}

// Handle stop signal
process.on("SIGINT", () => {
  client.destroy();
  db.$disconnect();
  logger.info("Bot Stopped");
});
