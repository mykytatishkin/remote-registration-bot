const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { connectToDatabase } = require('./db');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        console.log(`Loading command file: ${filePath}`);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`Command ${command.data.name} loaded`);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

let dbPool;

async function initializeDatabase() {
    try {
        dbPool = await connectToDatabase();
        console.log('Connected to the database.');
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        setTimeout(initializeDatabase, 5000); // Retry connection after 5 seconds
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        if (!dbPool) throw new Error('Database connection is not established.');
        await command.execute(interaction, dbPool);
    } catch (error) {
        console.error('Error executing command:', error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
        if (error.message.includes('Database connection is not established')) {
            console.log('Attempting to reinitialize database connection...');
            initializeDatabase(); // Try to reconnect to the database
        }
    }
});

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    initializeDatabase(); // Initialize database connection when client is ready
});

client.login(token);