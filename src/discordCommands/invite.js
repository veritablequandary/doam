const { SlashCommandBuilder } = require('discord.js');
const { invite } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Invite the bot to your server to start running DOAMs.')
    .setDMPermission(false),

  run: async interaction => {
    await interaction.reply({ content: `[Click this link to invite DOAM to your server](${invite})`, ephemeral: true });
  },
};
