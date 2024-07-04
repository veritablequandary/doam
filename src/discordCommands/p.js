const { SlashCommandBuilder, userMention } = require('discord.js');
const { doams } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('p')
    .setDescription('Submit your pitch!')
    .addIntegerOption(o =>
      o.setName('number').setDescription('Enter your pitch number').setRequired(true).setMinValue(1).setMaxValue(1000)
    )
    .setDMPermission(false),

  run: async interaction => {
    await interaction.deferReply({ ephemeral: true });

    // Fetch the DOAM status for the current server and verify that it is the user's turn to pitch
    const doam = doams.get(interaction.guild.id);
    if (!doam) {
      await interaction.editReply('There is not a DOAM currently active on this server.');
      return;
    }
    if (![doam.p1, doam.p2].includes(interaction.user.id)) {
      await interaction.editReply('You are not a participant in the currently active DOAM.');
      return;
    }
    if (doam.status !== 'wfp') {
      await interaction.editReply('Please wait - you will receive a ping in the DOAM channel when it is time to pitch!');
      return;
    }
    if (doam.p !== interaction.user.id) {
      await interaction.editReply('Please wait - it is not your turn to pitch!');
      return;
    }

    // Delete previous messages and ping the hitter to swing
    const channel = await interaction.guild.channels.fetch(doam.channel);
    const m = await channel.messages.fetch(doam.message);
    await m.delete();
    await interaction.deleteReply();
    const message = await channel.send(`${userMention(doam.h)} - use /s to submit your swing!`);

    // Update the stored DOAM status
    doam.pitch = interaction.options.getInteger('number');
    doam.status = 'wfs';
    doam.message = message.id;
    doams.set(interaction.guild.id, doam);
  },
};
