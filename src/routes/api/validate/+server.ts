import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionData, updateSessionData } from '$lib/sessionHandler';
import { isAccountUnique, isDiscordUnique, isTwitterUnique } from '$lib/userHandler';


export const GET: RequestHandler = async ({ request, url, params }) => {
    // get URLparams from request
    const urlParams = new URLSearchParams(url.search);
    let param = urlParams.get('message');

    if (!param) {
        return error(400, 'Message parameter is missing');
    }

    const [user1, rest] = param.split(':');

    if (!rest) {
        return error(400, 'Message format is incorrect: missing :');
    }

    const [user2, account] = rest.split(';');
    if (!account) {
        return error(400, 'Message format is incorrect: missing ; or account');
    }


    let discordIsUnique = await isDiscordUnique(user1);
    let twitterIsUnique = await isTwitterUnique(user2);
    let accountIsUnique = await isAccountUnique(account);

    let validation = {
        discordIsUnique: discordIsUnique,
        twitterIsUnique: twitterIsUnique,
        accountIsUnique: accountIsUnique
    }

    if (!discordIsUnique) {
        return error(400, 'Discord username is not unique');
    }
    if (!twitterIsUnique) {
        return error(400, 'Twitter username is not unique');
    }
    if (!accountIsUnique) {
        return error(400, 'Account is not unique');
    }

    // if message is in the correct format then return success
    return new Response(JSON.stringify({ ...validation }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}