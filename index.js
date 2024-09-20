import 'dotenv/config';
import {
    Client,
    GatewayIntentBits,
    REST,
    EmbedBuilder,
    SlashCommandBuilder,
    Routes
} from 'discord.js';

import {handleJourneysCommand} from './src/commands/journey.js';

const rest = new REST({ version: '10' }).setToken(process.env.CLIENT_TOKEN);

// Initialize the Discord bot client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const commands = [
    new SlashCommandBuilder()
        .setName('journeys')
        .setDescription('Get journey details between two stations')
        .addStringOption(option => option.setName('from').setDescription('Starting station').setRequired(true))
        .addStringOption(option => option.setName('to').setDescription('Destination station').setRequired(true))
];

// Register the slash command
(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('Successfully registered commands.');
    } catch (error) {
        console.error(error);
    }
})();

// Handle incoming commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'journeys') {
        await handleJourneysCommand(interaction); // Use the imported function
    }
});
client.login(process.env.CLIENT_TOKEN);