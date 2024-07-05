const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Invite the bot to your server to start running DOAMs.')
    .setDMPermission(false),

  run: async interaction => {
    if (process.env.DISCORD_INVITELINK) {
      await interaction.reply({
        content: `[Click this link to invite DOAM to your server](${process.env.DISCORD_INVITELINK})`,
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: 'No invite link set - please contact Sterling to get the bot onto your server.',
      ephemeral: true,
    });
  },
};
