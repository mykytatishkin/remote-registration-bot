const { SlashCommandBuilder } = require('discord.js');
const sql = require('mssql');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register with your password * Note! At the registration, password won`t be shown')
        .addStringOption(option =>
            option.setName('password')
                .setDescription('Your password')
                .setRequired(true)),
    async execute(interaction, pool) {
        const password = interaction.options.getString('password');
        const discordId = interaction.user.id;
        const discordUsername = interaction.user.username;
        const registrationDate = new Date();
        const updateProfileDate = new Date();
        const roleId = '1251847741382983720'; // Replace with the ID of the role you want to assign

        const checkQuery = `
            SELECT COUNT(*) as count FROM users WHERE discordId = @discordId
        `;

        const insertQuery = `
            INSERT INTO users (discordId, discordUsername, password, registrationDate, updateProfileDate)
            VALUES (@discordId, @discordUsername, @password, @registrationDate, @updateProfileDate)
        `;

        try {
            const request = pool.request();
            request.input('discordId', sql.VarChar(20), discordId);

            // Check if user already exists
            const checkResult = await request.query(checkQuery);
            const userExists = checkResult.recordset[0].count > 0;

            if (userExists) {
                // If the user is already registered, assign the role and notify them
                const member = await interaction.guild.members.fetch(discordId);
                await member.roles.add(roleId);
                await interaction.reply({ content: 'You are already registered. Role has been assigned to you!', ephemeral: true });
                return;
            }

            // Insert new user data
            request.input('discordUsername', sql.VarChar(128), discordUsername);
            request.input('password', sql.VarChar(120), password);
            request.input('registrationDate', sql.DateTime, registrationDate);
            request.input('updateProfileDate', sql.DateTime, updateProfileDate);

            await request.query(insertQuery);

            // Assign role to the new user
            const member = await interaction.guild.members.fetch(discordId);
            await member.roles.add(roleId);

            await interaction.reply('You have been successfully registered and assigned a role!');
        } catch (error) {
            console.error('SQL error:', error);
            await interaction.reply({ content: 'There was an error while registering. Please try again later.', ephemeral: true });
        }
    },
};