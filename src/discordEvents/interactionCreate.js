const { commands } = require('../config');
const { log } = require('../log');

async function autocomplete(interaction) {
  const command = commands.get(interaction.commandName);
  if (!command) {
    log.warn(
      { userDisplayName: interaction.user.displayName, commandName: interaction.commandName },
      'Command data not found.'
    );
    return;
  }

  await command.ac(interaction);
}

exports.interactionCreate = async interaction => {
  if (interaction.isAutocomplete()) {
    await autocomplete(interaction);
  }

  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);
    if (!command) {
      log.warn(
        { userDisplayName: interaction.user.displayName, commandName: interaction.commandName },
        'Command data not found.'
      );
      await interaction.editReply('Command not found.');
      return;
    }

    log.info(
      { userDisplayName: interaction.user.displayName, commandName: interaction.commandName },
      'Command executed by user.'
    );
    await command.run(interaction);
  }
};
