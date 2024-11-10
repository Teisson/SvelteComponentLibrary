import { getDiscordAuth, discordError } from '$lib/discordAuth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { updateSessionData } from '$lib/sessionHandler'

interface DiscordUser {
    [key: string]: any;
    // Add other properties if needed
}
import type { SessionData } from '$lib/sessionHandler';




export const load = (async ({ url, cookies }) => {
    let code = url.searchParams.get("code");
    console.log('discord:code:' + code)
    let _idcookie = cookies.get('session_id')
    console.log('sessioncookie:' + _idcookie)
    if (!_idcookie) return { error: "no _id cookie present, invalid session." }

    // If no authorization code is provided
    if (!code) {
        console.log('session-error: !code')
        return { error: "No authorization code provided" };
    }


    // Attempt to authenticate with Discord using the provided code
    let discordUserResponse = await getDiscordAuth(code);

    // Check for errors in the response
    if (discordUserResponse.error) {
        discordError(discordUserResponse)
    }

    // Successful authentication, store the Discord user data

    const discordUser = discordUserResponse.user as DiscordUser;
    let sessionID = cookies.get('sessionID') as string | undefined;
    let session_id = cookies.get('session_id') as string | undefined;

    // if (discordUser && sessionId) 

    if (discordUser?.username && sessionID) {
        updateSessionData(sessionID, { discord: discordUser })
        redirect(301, '/register')
    }


}) satisfies PageServerLoad;