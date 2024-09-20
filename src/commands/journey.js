import { EmbedBuilder } from 'discord.js';
import { REST, Routes } from 'discord.js';
import { hafas } from '../createHafasClient.js';



const formatDate = (date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const today = now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowDate = tomorrow.toDateString();
    const dateStr = targetDate.toDateString();

    if (dateStr === today) {
        return `Today at ${targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (dateStr === tomorrowDate) {
        return `Tomorrow at ${targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return targetDate.toLocaleDateString() + ' at ' + targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
};

const handleJourneysCommand = async (interaction) => {
    const fromName = interaction.options.getString('from');
    const toName = interaction.options.getString('to');
    const maxResults = interaction.options.getString('results');

    try {
        // Search for the 'from' and 'to' stations using Hafas Client
        const [fromResults, toResults] = await Promise.all(
            [hafas.locations(fromName), hafas.locations(toName)]
        );

        // Check if we found any results
        if (!fromResults || fromResults.length === 0 || !toResults || toResults.length === 0) {
            await interaction.reply('One or both of the stations were not found.');
            return;
        }

        // Assuming the first result is the most relevant
        const fromStation = fromResults[0];
        const toStation = toResults[0];
        const fromIBNR = fromStation.id;
        const toIBNR = toStation.id;

        const fromStationName = fromStation.name;
        const toStationName = toStation.name;

        // Fetch journey details for 'from' and 'to' using IBNR numbers
        const journeys = await hafas.journeys(fromIBNR, toIBNR, {results: maxResults || 3});

        if (journeys && journeys.journeys && journeys.journeys.length > 0) {
            // Create an array to hold multiple embeds Create an array to hold multiple
            // embeds Create an array to hold multiple embeds Create an array to hold
            // multiple embeds
            const embeds = journeys
                .journeys
                .map(journey => {
                    const firstLeg = journey.legs[0];

                    // Determine the color based on the train or bus type
                    let color;
                    if (
                        firstLeg.line
                            ?.name && /^(S|REX)/.test(firstLeg.line.name)
                    ) {
                        color = '#0099ff'; // Blue for local trains
                    } else if (
                        firstLeg.line
                            ?.name && /^(RJ|RJX|EC|IC)/.test(firstLeg.line.name)
                    ) {
                        color = '#ff0000'; // Red for long-distance trains
                    } else if (
                        firstLeg.line
                            ?.name && /^(Bus)/.test(firstLeg.line.name)
                    ) {
                        color = '#808080'; // Gray for buses
                    } else if (
                        firstLeg.line 
                            ?.name && /^(NJ|EN)/.test(firstLeg.line.name)
                    ) {
                        color = '#000048'; 
                    } else {
                        color = '#00ff00'; // Default color
                    }

                    const embed = new EmbedBuilder()
                        .setColor(color)
                        .setTitle(
                            `Journey - ${fromStation.name} -> ${toStation.name}`
                        )

                    journey
                        .legs
                        .forEach((leg, index) => {
                            if (leg) {
                                const departure = formatDate(leg.departure);
                                const arrival = formatDate(leg.arrival);

                                const previousArrival = journey.legs[index - 1]?.arrivalPlatform || 'N/A'
                                const nextDeparture = journey.legs[index + 1]?.departurePlatform || 'N/A'

                                if (!leg.line || !leg.line.name || leg.line.name === '') {
                                    // Handle cases where leg.line.name is empty or undefined
                                    embed.addFields({
                                        name: `**Change**`,
                                        value: `From **${previousArrival}** to **${nextDeparture}**`,
                                        inline: false
                                    });
                                } else {
                                    embed.addFields({
                                        name: leg.line
                                            ?.name
                                                ? `${leg.line.name}`
                                                : 'Unknown Line',
                                        value: leg.line
                                            ?.name
                                                ? `**Departure:** ${departure} from ${leg.departurePlatform || 'N/A'}\n**Arrival:** ${arrival} on ${leg.arrivalPlatform || 'N/A'}`
                                                : '',
                                        inline: true
                                    });
                                }
                            }
                        });

                    return embed;
                });

            // Send all embeds as a response
            await interaction.reply({embeds});
            console.log(
                `User ${interaction.user.username} requested journey details for ${fromStationName} -> ${toStationName}`
            );
        } else {
            await interaction.reply('No journeys found for the given stations.');
        }
    } catch (error) {
        console.error('Error fetching journeys:', error);
        await interaction.reply(
            'There was an error fetching the journey details. Please check the station name' +
            's.'
        );
    }
}


export {handleJourneysCommand};