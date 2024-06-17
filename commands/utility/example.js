const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('example')
        .setDescription('Example command that interacts with the database'),
    async execute(interaction, pool) {
        try {
            const result = await pool.request().query('SELECT TOP 1 * FROM your_table');
            await interaction.reply(`Query result: ${JSON.stringify(result.recordset[0])}`);
        } catch (err) {
            console.error('SQL query error:', err);
            await interaction.reply({ content: 'There was an error executing the query.', ephemeral: true });
        }
    },
};