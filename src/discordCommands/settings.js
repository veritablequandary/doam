const { SlashCommandBuilder, EmbedBuilder, channelMention, roleMention } = require('discord.js');
const { serverSettings } = require('../config');

module.exports = {
  data: new SlashCommandBuilder().setName('settings').setDescription('View DOAM bot server settings').setDMPermission(false),

  run: async interaction => {
    await interaction.deferReply({ ephemeral: true });
    const settings = serverSettings.get(interaction.guild.id);

    if (!settings) {
      await interaction.editReply('No settings found - use `/setup` to set up this server!');
      return;
    }

    const c = settings.channel === null ? 'None' : channelMention(settings.channel);
    const p = settings.pingRole === null ? 'None' : roleMention(settings.pingRole);
    const a = settings.adminRole === null ? 'None' : roleMention(settings.adminRole);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Server Settings')
          .addFields(
            { name: 'DOAM Channel:', value: c },
            { name: 'Ping Role:', value: p },
            { name: 'Admin Role', value: a }
          ),
      ],
    });
  },
};
