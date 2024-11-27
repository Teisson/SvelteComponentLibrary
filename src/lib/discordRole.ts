import { Client, GatewayIntentBits } from 'discord.js';
import { error, type HttpError } from '@sveltejs/kit';
import { BOTTOKEN } from '$env/static/private';
import { knownDiscordUsername } from './userHandler';
// Replace with your bot token
const BOT_TOKEN = BOTTOKEN;

// Initialize the bot client
const client = new Client({
    intents: 1
});



// Example usage
const guildId = '952943370676887553';
let ready = false;

client.on('ready', async () => {
    ready = true
});



// Event listener for when the bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    ready = true;
});

// Function to ensure the bot is logged in and ready
const ensureBotReady = async () => {
    if (!ready) {
        if (!client.token) {
            await client.login(BOT_TOKEN); // Log in the bot
        }
        await new Promise((resolve) => client.once('ready', resolve)); // Wait for the bot to be ready
    }
};


export const getUserRolesByUsername = async (username: string): Promise<string[] | null> => {
    try {
        await ensureBotReady(); // Ensure bot is ready

        const guildId = '952943370676887553';
        const guild = await client.guilds.fetch(guildId);

        if (!guild) throw error(404, 'Guild not found');

        const members = await guild.members.fetch({ query: username, limit: 1 });
        const member = members.first();

        if (!member) throw error(404, 'User not found on Discord server');

        const validname = await knownDiscordUsername(username);

        if (!validname) throw error(404, 'User not found in database');

        return member.roles.cache.map((role) => role.name);
    } catch (err) {
        // Properly type the error
        if (err instanceof error) {
            const typedError = err as HttpError;
            console.error(`Error fetching roles for user ${username}:`, typedError.body?.message);
        } else {
            console.error(`Unknown error occurred for user ${username}:`, err);
        }
        throw err; // Re-throw the error so it propagates correctly
    }
};