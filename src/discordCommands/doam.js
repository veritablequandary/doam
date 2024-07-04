const {
  SlashCommandBuilder,
  roleMention,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  userMention,
} = require('discord.js');
const { serverSettings, doams } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('doam')
    .setDescription('Start a new DOAM!')
    .addUserOption(o => o.setName('playerone').setDescription('Player One (Hits First)').setRequired(true))
    .addUserOption(o => o.setName('playertwo').setDescription('Player Two (Hits Second)').setRequired(true))
    .setDMPermission(false),

  run: async interaction => {
    await interaction.deferReply({ ephemeral: true });
    const settings = serverSettings.get(interaction.guild.id);
    if (!settings) {
      await interaction.editReply('No configuration found for this server - please use `/setup` first!');
      return;
    }

    // If the adminRole is set, user must have that role to start a DOAM
    if (settings.adminRole && !interaction.member.roles.cache.has(settings.adminRole)) {
      await interaction.editReply(
        `You must have the ${roleMention(settings.adminRole)} role to start DOAMs in this server!`
      );
      return;
    }

    // If there is already a DOAM in progress on the server, a new one can't be started
    const activeDoam = doams.get(interaction.guild.id);
    if (activeDoam) {
      await interaction.editReply('Please wait for the current DOAM on this server to finish before starting another DOAM!');
      return;
    }

    const channel = settings.channel ? await interaction.guild.channels.fetch(settings.channel) : interaction.channel;
    const playerOne = interaction.options.getUser('playerone');
    const playerTwo = interaction.options.getUser('playertwo');
    const p1member = await interaction.guild.members.fetch(playerOne.id);
    const p2member = await interaction.guild.members.fetch(playerTwo.id);

    // Send challenge message to Player One and await response
    await interaction.deleteReply();
    const acceptButton = new ButtonBuilder().setCustomId('accept').setLabel('Accept').setStyle(ButtonStyle.Success);
    const declineButton = new ButtonBuilder().setCustomId('decline').setLabel('Decline').setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(acceptButton, declineButton);
    const confirmMessage = await channel.send({
      content: `${userMention(playerOne.id)} - you have been challenged to a DOAM! Please accept or decline the challenge in the next *two minutes*.`,
      components: [row],
    });
    const challengeFilter = i => i.user.id === playerOne.id;
    try {
      const decision = await confirmMessage.awaitMessageComponent({ filter: challengeFilter, time: 120000 });
      if (decision.customId === 'accept') {
        await confirmMessage.delete();
      } else {
        await confirmMessage.delete();
        await channel.send(`${userMention(playerOne.id)} has declined the challenge.`);
        return;
      }
    } catch (e) {
      await confirmMessage.delete();
      await channel.send(`${userMention(playerOne.id)} did not respond to the challenge in time.`);
      return;
    }

    // Send challenge message to Player Two and await response
    const confirmMessageTwo = await channel.send({
      content: `${userMention(playerTwo.id)} - you have been challenged to a DOAM! You have two minutes to accept or decline.`,
      components: [row],
    });
    const challengeFilterTwo = i => i.user.id === playerTwo.id;
    try {
      const decision = await confirmMessageTwo.awaitMessageComponent({ filter: challengeFilterTwo, time: 120000 });
      if (decision.customId === 'accept') {
        await confirmMessageTwo.delete();
      } else {
        await confirmMessageTwo.delete();
        await channel.send(`${userMention(playerTwo.id)} has declined the challenge.`);
        return;
      }
    } catch (e) {
      await confirmMessageTwo.delete();
      await channel.send(`${userMention(playerTwo.id)} did not respond to the challenge in time.`);
      return;
    }

    // If this code is reached, both players accepted the challenge

    // If the pingRole is defined, ping it, and then announce the start of the DOAM
    if (settings.pingRole) await channel.send(roleMention(settings.pingRole));
    await channel.send(`## ${userMention(playerOne.id)} & ${userMention(playerTwo.id)} it's time to DOAM!`);

    // Announce the start of Round 1 and ping Player Two to pitch
    await channel.send(`### __ROUND 1__`);
    const message = await channel.send(`${userMention(playerTwo.id)} - use /p to submit your pitch!`);

    // Add the record for the DOAM to memory
    doams.set(interaction.guild.id, {
      channel: channel.id,
      p1: playerOne.id,
      p1name: p1member.displayName,
      s1: 0,
      p2: playerTwo.id,
      p2name: p2member.displayName,
      s2: 0,
      h: playerOne.id,
      p: playerTwo.id,
      round: 1,
      status: 'wfp',
      pitch: 0,
      message: message.id,
    });
  },
};
