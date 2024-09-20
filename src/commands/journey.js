import {SlashCommandBuilder} from 'discord.js';

function journeySlashCommand() {
    new SlashCommandBuilder()
        .setName('journeys')
        .setDescription('Get journey details between two stations using station names')
        .addStringOption(
            option => option.setName('from').setDescription('Starting station name').setRequired(true)
        )
        .addStringOption(
            option => option.setName('to').setDescription('Destination station name').setRequired(true)
        )
        .addStringOption(
            option => option.setName('results').setDescription('Number of results').setRequired(false)
        )
}

export default journeySlashCommand