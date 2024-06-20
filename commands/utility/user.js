const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides information about the user.'),
    async execute(interaction) {
        const username = interaction.user.username;
        const joinedAt = interaction.member.joinedAt;

        // Logging user information to console
        console.log(`[${new Date().toISOString()}] User "${username}" information requested. Joined at: ${joinedAt}`);

        await interaction.reply(`This command was run by ${username}, who joined on ${joinedAt}.`);
    },
};