const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const sql = require('mssql');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register with your password * Note! At the registration, password won`t be shown'),
    async execute(interaction, pool) {
        console.log('register command executed'); // Debug log

        // Create a modal
        const modal = new ModalBuilder()
            .setCustomId('registerModal')
            .setTitle('Register');

        // Add a text input for the password
        const passwordInput = new TextInputBuilder()
            .setCustomId('password')
            .setLabel('Password')
            .setStyle(TextInputStyle.Short)
            .setMinLength(8)
            .setMaxLength(32)
            .setRequired(true);

        // Create an action row and add the text input
        const actionRow = new ActionRowBuilder().addComponents(passwordInput);

        // Add the action row to the modal
        modal.addComponents(actionRow);

        // Show the modal to the user
        await interaction.showModal(modal);
        console.log('Modal shown to user'); // Debug log
    },
    async handleModalSubmission(modalInteraction, pool) {
        if (modalInteraction.customId === 'registerModal') {
            console.log('Modal submitted'); // Debug log
            const password = modalInteraction.fields.getTextInputValue('password');
            const discordId = modalInteraction.user.id;
            const discordUsername = modalInteraction.user.username;
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
                    const member = await modalInteraction.guild.members.fetch(discordId);
                    await member.roles.add(roleId);
                    await modalInteraction.reply({ content: 'You are already registered. Role has been assigned to you!', ephemeral: true });

                    // Log registration attempt
                    console.log(`[${new Date().toISOString()}][${discordId}][${discordUsername}] attempted to register (already registered)`);
                    return;
                }

                // Insert new user data
                request.input('discordUsername', sql.VarChar(128), discordUsername);
                request.input('password', sql.VarChar(120), password);
                request.input('registrationDate', sql.DateTime, registrationDate);
                request.input('updateProfileDate', sql.DateTime, updateProfileDate);

                await request.query(insertQuery);

                // Assign role to the new user
                const member = await modalInteraction.guild.members.fetch(discordId);
                await member.roles.add(roleId);

                await modalInteraction.reply('You have been successfully registered and assigned a role!');

                // Log registration
                console.log(`[${new Date().toISOString()}][${discordId}][${discordUsername}] successfully registered`);
            } catch (error) {
                console.error('SQL error:', error);
                await modalInteraction.reply({ content: 'There was an error while registering. Please try again later.', ephemeral: true });

                // Log registration error
                console.error(`[${new Date().toISOString()}][${discordId}][${discordUsername}] registration error:`, error);
            }
        }
    }
};