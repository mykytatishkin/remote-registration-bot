const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userlist')
        .setDescription('Команда выводит список всех пользователей из базы данных, только для разработчиков.'),
    async execute(interaction, pool) {
        // Проверяем, есть ли у пользователя права администратора
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            // Изменяем флаг ephemeral на false, чтобы сообщение было видимым в чате
            return interaction.reply({ content: 'У вас нет прав для использования этой команды.', ephemeral: false });
        }

        try {
            const result = await pool.request().query('SELECT discordId, discordUsername, registrationDate, updateProfileDate FROM users;');
            const records = result.recordset;

            if (records.length === 0) {
                await interaction.reply('Записи не найдены.');
            } else {
                // Преобразуем каждую запись в строку и объединим их с помощью переносов строк
                const formattedRecords = records.map(record => JSON.stringify(record, null, 2)).join('\n\n');
                await interaction.reply(`Результат запроса:\n${formattedRecords}`);
            }
        } catch (err) {
            console.error('Ошибка SQL-запроса:', err);
            await interaction.reply({ content: 'При выполнении запроса произошла ошибка.', ephemeral: true });
        }
    },
};