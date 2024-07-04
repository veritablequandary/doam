const { Collection } = require('discord.js');

// Stores Discord application command settings and execution functions
exports.commands = new Collection();

// This variable should contain the absolute path to a local 'servers.json' file. On first use, the file should be empty,
// and it should PERSIST THROUGH CODE UPDATES (otherwise each server will have to re-configure server settings on
// every bot restart). This is my hacky way to not have to use a database to store server settings.
exports.serversFile = '/data/servers.json';

// The settings from the serversFile are cached in this collection on startup; that way, I only have to write to the file
// When a new server's settings are added / updated, and retrieval of current settings (which are used in most commands)
// is much faster.
exports.serverSettings = new Collection();

// Stores the settings of currently running DOAMS on all servers. Again, for now I've chosen not to use a database; because
// of this, if the bot restarts, ALL currently active DOAMs will be cleared from memory. Adding a simple database is probably
// something I'll pursue in the long term, but the additional management of that isn't something I'm ready to tackle yet.
exports.doams = new Collection();
