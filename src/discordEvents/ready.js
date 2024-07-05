const { REST, Routes } = require('discord.js');
const { join } = require('path');
const { readdirSync, readFileSync, existsSync } = require('fs');
const { commands, serverSettings, serversFile } = require('../config');
const { log } = require('../log');

async function deployCommands() {
  const commandsDir = join(__dirname, '../discordCommands');
  const commandsDirFiles = readdirSync(commandsDir);

  const toDeploy = [];
  for (const file of commandsDirFiles) {
    const module = require(join(commandsDir, file));
    commands.set(module.data.name, module);
    toDeploy.push(module.data.toJSON());
  }

  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  await rest.put(Routes.applicationCommands(process.env.DISCORD_APPID), { body: toDeploy });
}

exports.ready = async () => {
  await deployCommands();

  if (existsSync(serversFile)) {
    const file = JSON.parse(readFileSync(serversFile));
    for (const key of Object.keys(file)) {
      serverSettings.set(key, file[key]);
    }
  }

  log.info('Startup complete');
};
