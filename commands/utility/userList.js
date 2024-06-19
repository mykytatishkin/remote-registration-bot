const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userlist')
        .setDescription('Command will show all users from database, only for developers'),
    async execute(interaction, pool) {
        // Check if the user has the "ADMINISTRATOR" permission
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        try {
            const result = await pool.request().query('SELECT discordId, discordUsername, registrationDate, updateProfileDate FROM users;');
            const records = result.recordset;

            if (records.length === 0) {
                await interaction.reply('No records found.');
            } else {
                // Convert each record to a string and join them with new lines
                const formattedRecords = records.map(record => JSON.stringify(record, null, 2)).join('\n\n');
                await interaction.reply(`Query result:\n${formattedRecords}`);
            }
        } catch (err) {
            console.error('SQL query error:', err);
            await interaction.reply({ content: 'There was an error executing the query.', ephemeral: true });
        }
    },
};