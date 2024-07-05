const { SlashCommandBuilder, roleMention, userMention } = require('discord.js');
const { serverSettings, doams } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the current DOAM on this server.')
    .setDMPermission(false),

  run: async interaction => {
    await interaction.deferReply({ ephemeral: true });
    const settings = serverSettings.get(interaction.guild.id);

    if (settings.adminRole && !interaction.member.roles.cache.has(settings.adminRole)) {
      await interaction.editReply(`You must have the ${roleMention(settings.adminRole)} role to stop DOAMs in this server!`);
      return;
    }

    const activeDoam = doams.get(interaction.guild.id);
    if (!activeDoam) {
      await interaction.editReply('There is not an in-progress DOAM to stop on this server!');
      return;
    }

    doams.delete(interaction.guild.id);

    await interaction.deleteReply();
    const channel = await interaction.guild.channels.fetch(activeDoam.channel);
    await channel.send(`DOAM stopped by ${userMention(interaction.user.id)}`);

    return;
  },
};
