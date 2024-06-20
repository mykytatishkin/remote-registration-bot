const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        const { user, guild } = interaction;

        // Получаем текущую дату и время
        const now = new Date();
        const dateTimeString = now.toISOString();

        // Получаем информацию о пользователе (id и никнейм)
        const userId = user.id;
        const nickname = guild.members.cache.get(userId).displayName;

        // Выводим оповещение в консоль
        console.log(`[${dateTimeString}][${userId}][${nickname}] исполнил команду /ping`);

        // Отвечаем на команду
        await interaction.reply('Pong!');
    },
};