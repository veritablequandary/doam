const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { ready } = require('./discordEvents/ready');
const { interactionCreate } = require('./discordEvents/interactionCreate');
const { log } = require('./log');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],

  presence: {
    status: 'online',
    name: 'DOAM',
    activities: [
      {
        name: 'doam.',
        state: 'doam.',
        type: ActivityType.Custom,
      },
    ],
  },
});

client.on('interactionCreate', async interaction => {
  await interactionCreate(interaction);
});

client.on('ready', async readyClient => {
  await ready(readyClient);
});

process.on('uncaughtException', e => {
  log.error(e);
});

process.on('unhandledRejection', e => {
  log.error(e);
});

log.info('Commencing startup...');
client.login(process.env.DISCORD_TOKEN);
