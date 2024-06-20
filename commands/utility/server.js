const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Provides information about the server.'),
    async execute(interaction) {
        // interaction.guild is the object representing the Guild in which the command was run
        const serverName = interaction.guild.name;
        const memberCount = interaction.guild.memberCount;

        // Logging server information to console
        console.log(`[${new Date().toISOString()}] Server "${serverName}" information requested. Members: ${memberCount}`);

        await interaction.reply(`This server is ${serverName} and has ${memberCount} members.`);
    },
};