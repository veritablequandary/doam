const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const { serversFile, serverSettings } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Set up your server to start running DOAMs!')
    .addChannelOption(o => o.setName('channel').setDescription('Restrict DOAMs to a specific channel or thread.'))
    .addRoleOption(o => o.setName('pingrole').setDescription('Set a role to be pinged when new DOAMs start!'))
    .addRoleOption(o => o.setName('adminrole').setDescription('Restrict the starting of DOAMs to this role.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  run: async interaction => {
    await interaction.deferReply({ ephemeral: true });

    const updatedSettings = {
      channel: null,
      pingRole: null,
      adminRole: null,
    };

    const [c, p, a] = [
      interaction.options.getChannel('channel'),
      interaction.options.getRole('pingrole'),
      interaction.options.getRole('adminrole'),
    ];

    if (c) updatedSettings.channel = c.id;
    if (p) updatedSettings.pingRole = p.id;
    if (a) updatedSettings.adminRole = a.id;

    if (existsSync(serversFile)) {
      const file = JSON.parse(readFileSync(serversFile));
      file[interaction.guild.id] = updatedSettings;
      writeFileSync(serversFile, JSON.stringify(file));
    } else {
      const file = {};
      file[interaction.guild.id] = updatedSettings;
      writeFileSync(serversFile, JSON.stringify(file));
    }

    serverSettings.set(interaction.guild.id, updatedSettings);

    await interaction.editReply(
      'Server setup complete - use `/settings` to view your server settings, or `/doam` to start your first DOAM!'
    );
  },
};
