import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionData, updateSessionData } from '$lib/sessionHandler';
import { isAccountUnique, isDiscordUnique, isTwitterUnique } from '$lib/userHandler';

import { getUserRolesByUsername } from '$lib/discordRole';

export const GET: RequestHandler = async ({ request, url, params }) => {
    // get URLparams from request
    const urlParams = new URLSearchParams(url.search);
    let usr = urlParams.get('username');

    if (!usr) {
        return error(400, 'username parameter is missing');
    }

    let roles = await getUserRolesByUsername(usr)
    if (!roles) { return error(400, 'User not found') }
    // if message is in the correct format then return success
    return new Response(JSON.stringify({ roles }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}