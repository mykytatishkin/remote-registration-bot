const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, InteractionType } = require('discord.js');
const sql = require('mssql');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forgetpassword')
        .setDescription('Use if you forgot your password'),
    async execute(interaction, pool) {
        console.log('forgetpassword command executed');  // Debug log

        const { user, guild } = interaction;

        // Create a modal
        const modal = new ModalBuilder()
            .setCustomId('forgetpasswordModal')
            .setTitle('Reset Password');

        // Add a text input for the new password
        const passwordInput = new TextInputBuilder()
            .setCustomId('newPassword')
            .setLabel('New Password')
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
        console.log('Modal shown to user');  // Debug log
    },
    async handleModalSubmission(modalInteraction, pool) {
        if (modalInteraction.customId === 'forgetpasswordModal') {
            console.log('Modal submitted');  // Debug log
            const newPassword = modalInteraction.fields.getTextInputValue('newPassword');
            const discordId = modalInteraction.user.id;
            const updateProfileDate = new Date();

            const updateQuery = `
                UPDATE users
                SET password = @newPassword, updateProfileDate = @updateProfileDate
                WHERE discordId = @discordId
            `;

            const checkQuery = `
                SELECT * FROM users WHERE discordId = @discordId
            `;

            try {
                const request = pool.request();
                request.input('discordId', sql.VarChar(20), discordId);

                // Check if user exists
                const checkResult = await request.query(checkQuery);
                console.log('Check Result:', checkResult.recordset);

                if (checkResult.recordset.length === 0) {
                    await modalInteraction.reply({ content: 'User not found.', ephemeral: true });
                    return;
                }

                request.input('newPassword', sql.VarChar(120), newPassword);
                request.input('updateProfileDate', sql.DateTime, updateProfileDate);

                const result = await request.query(updateQuery);
                console.log('Update Result:', result);  // Debug log

                if (result.rowsAffected[0] > 0) {
                    await modalInteraction.reply({ content: 'Your password has been updated successfully.', ephemeral: true });
                } else {
                    await modalInteraction.reply({ content: 'Failed to update password.', ephemeral: true });
                }

                // Log the event
                const now = new Date();
                const dateTimeString = now.toISOString();
                const nickname = modalInteraction.guild.members.cache.get(discordId).displayName;
                console.log(`[${dateTimeString}][${discordId}][${nickname}] executed /forgetpassword`);
            } catch (error) {
                console.error('SQL error:', error);

                await modalInteraction.reply({ content: 'An error occurred while updating your password. Please try again later.', ephemeral: true });

                // Log error
                const now = new Date();
                const dateTimeString = now.toISOString();
                console.error(`[${dateTimeString}][${discordId}] password reset error:`, error);
            }
        }
    }
};