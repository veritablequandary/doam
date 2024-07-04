const { SlashCommandBuilder, userMention, codeBlock } = require('discord.js');
const { doams } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('s')
    .setDescription('Submit your swing!')
    .addIntegerOption(o =>
      o.setName('number').setDescription('Enter your swing number').setRequired(true).setMinValue(1).setMaxValue(1000)
    )
    .setDMPermission(false),

  run: async interaction => {
    await interaction.deferReply({ ephemeral: true });

    // Fetch the DOAM status for the current server and verify that it is the user's turn to swing.
    const doam = doams.get(interaction.guild.id);
    if (!doam) {
      await interaction.editReply('There is not a DOAM currently active on this server.');
      return;
    }
    if (![doam.p1, doam.p2].includes(interaction.user.id)) {
      await interaction.editReply('You are not a participant in the currently active DOAM.');
      return;
    }
    if (doam.status !== 'wfs') {
      await interaction.editReply('Please wait - you will receive a ping in the DOAM channel when it is time to swing!');
      return;
    }
    if (doam.h !== interaction.user.id) {
      await interaction.editReply('Please wait - it is not your turn to swing!');
      return;
    }

    // Fetch the swing and calculate the diff
    const swing = interaction.options.getInteger('number');
    const d = diff(doam.pitch, swing);

    // Generate the score display, and update the score if the result was a HR
    if (d <= 100) {
      if (doam.h === doam.p1) doam.s1 += 1;
      if (doam.h === doam.p2) doam.s2 += 1;
    }
    const hrDisplay = d <= 100 ? 'HR' : 'No HR';

    const channel = await interaction.guild.channels.fetch(doam.channel);
    const m = await channel.messages.fetch(doam.message);
    await m.delete();
    await interaction.deleteReply();
    await channel.send(
      codeBlock(
        `Pitch: ${doam.pitch}\nSwing: ${swing}\nDiff: ${d} --> ${hrDisplay}\n\n--- Scores ---\n${doam.p1name}: ${doam.s1}\n${doam.p2name}: ${doam.s2}`
      )
    );

    // If the current round is between 11 and 20, player 2 could potentially win on any round
    // If there is a winner, announce the winner and delete the DOAM record from memory
    if (doam.round >= 11 && doam.round <= 20) {
      let winner = 0;
      if (doam.s2 > doam.s1) winner = 2;
      if (winner === 0) {
        const roundsRemaining = 20 - doam.round;
        const lead = doam.s1 - doam.s2;
        if (roundsRemaining < lead) winner = 1;
      }
      if (winner !== 0) {
        await channel.send(winner === 1 ? `### ${userMention(doam.p1)} Wins!` : `### ${userMention(doam.p2)} Wins!`);
        await channel.send(codeBlock(`--- Final Score ---\n${doam.p1name}: ${doam.s1}\n${doam.p2name}: ${doam.s2}`));
        await doams.delete(interaction.guild.id);
        return;
      }
    }

    // If the current round is 22+ and is a multiple of 2, a sudden death win is possible
    // If there is a winner, announce the winner and delete the DOAM record from memory
    if (doam.round >= 22 && doam.round % 2 === 0) {
      let winner = 0;
      if (doam.s2 > doam.s1) winner = 2;
      if (doam.s1 > doam.s2) winner = 1;
      if (winner !== 0) {
        await channel.send(winner === 1 ? `### ${userMention(doam.p1)} Wins!` : `### ${userMention(doam.p2)} Wins!`);
        await channel.send(codeBlock(`--- Final Score ---\n${doam.p1name}: ${doam.s1}\n${doam.p2name}: ${doam.s2}`));
        await doams.delete(interaction.guild.id);
        return;
      }
    }

    // If the game continues, switch sides if needed
    if (doam.round === 10) {
      doam.h = doam.p2;
      doam.p = doam.p1;
      await channel.send('### __SWITCHING SIDES__');
    }

    // If the current round is 20 AND THERE IS NOT A WINNER (i.e. this code is reached), switch sides again
    if (doam.round >= 20) {
      if (doam.h === doam.p1) {
        doam.h = doam.p2;
      } else {
        doam.h = doam.p1;
      }

      if (doam.p === doam.p1) {
        doam.p = doam.p2;
      } else {
        doam.p = doam.p1;
      }
      await channel.send('### __SWITCHING SIDES__');
    }

    doam.round += 1;
    doam.status = 'wfp';

    await channel.send(`### __ROUND ${doam.round}__`);
    if (doam.round === 21) await channel.send(`### __SUDDEN DEATH!__`);
    const message = await channel.send(`${userMention(doam.p)} - use /p to submit your pitch!`);

    doam.message = message.id;
    doams.set(interaction.guild.id, doam);
  },
};

const diff = (pitch, swing) => {
  const base = Math.abs(swing - pitch);
  if (base > 500) {
    if (swing > 500) return Math.abs(1000 - swing + pitch);
    return Math.abs(1000 - pitch + swing);
  } else {
    return base;
  }
};
