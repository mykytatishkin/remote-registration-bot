const { connectToDatabase } = require('./db');

try {
    const pool = await connectToDatabase();
    await command.execute(interaction, pool);
} catch (error) {
    console.error('Error connecting to database', error);
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}

try {
    await pool.request().query('CREATE TABLE User (DiscordId int, DiscordName string, RegistrationTime datetime, Password string)');
} catch (error) {
    console.error(`Error creating table ${error}`);
}