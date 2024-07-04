const { REST, Routes } = require('discord.js');
const { join } = require('path');
const { readdirSync, readFileSync, existsSync } = require('fs');
const { commands, serverSettings, serversFile } = require('../config');
const { log } = require('../log');

async function deployCommands() {
  const toDeploy = [];

  const commandsDir = join(__dirname, '../discordCommands');
  const commandsDirFiles = readdirSync(commandsDir);

  for (const file of commandsDirFiles) {
    const module = require(join(commandsDir, file));
    commands.set(module.data.name, module);
    toDeploy.push(module.data.toJSON());
  }

  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  await rest.put(Routes.applicationCommands(process.env.DISCORD_APPID), { body: toDeploy });
  log.info(`Published ${commandsDirFiles.length} application commands to Discord gateway`);
}

exports.ready = async () => {
  log.info('Ready event received from Discord gateway');

  await deployCommands();

  log.info('Startup sequence complete...');

  if (existsSync(serversFile)) {
    const file = JSON.parse(readFileSync(serversFile));
    for (const key of Object.keys(file)) {
      serverSettings.set(key, file[key]);
    }
  }

  log.info('Server settings cached');
};
