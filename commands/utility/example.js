const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('example')
        .setDescription('Example command that interacts with the database'),
    async execute(interaction, pool) {
        try {
            const result = await pool.request().query('SELECT * FROM your_table');
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