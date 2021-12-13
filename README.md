![Sapphire Logo](https://raw.githubusercontent.com/DynamicaBot/Dynamica/master/assets/DynamicaBanner.png)

# Dynamica

[![Build Status](https://ci.sebasptsch.dev/api/badges/DynamicaBot/Dynamica/status.svg)](https://ci.sebasptsch.dev/DynamicaBot/Dynamica)

Dynamica, a bot designed to replicate the features of the Auto Voice Channels bot which has reached end of life. It dynamically assigns voice channels and renames them based on the current activity.

## Running

There are a few different ways to run this bot:

1. Let me run the bot for you. [Invite Link](https://discord.com/api/oauth2/authorize?client_id=916643283118198804&permissions=285212688&scope=bot%20applications.commands)

2. Clone the repository and run `yarn`, `yarn prisma migrate deploy` then `yarn start`. This will store the database files in the `config` directory. To update simply `git pull` then run `yarn prisma migrate deploy` and then `yarn start`.

3. The docker image. The easiest way to run this bot would be to either clone the repository and then run `docker-compose up -d`.

### Environment Variables

For both of the above deployment methods there are a few environment variables that need to be set.

- TOKEN - This is the discord bot token.
- CLIENT_ID - The bot's application or client id.
- GUILD_ID - The Id of the guild where the bot will be running in.

### Slash Commands

To add the slash commands to your own servers run `yarn deploy`.
