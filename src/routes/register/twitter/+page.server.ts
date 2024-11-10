// server load function

import { updateSessionData } from '$lib/sessionHandler';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { handleTwitterCallback } from '$lib/twitterAuth'



export const load = (async ({ url, params, cookies }) => {
    let sessionID = cookies.get('sessionID')
    let session_id = cookies.get('session_id')

    if (sessionID && session_id) {
        let code = url.searchParams.get('code')
        let state = url.searchParams.get('state')

        if (state === sessionID && code) {
            let user = await handleTwitterCallback(state, code, sessionID)
            console.log('/twitter:user', user)
            updateSessionData(sessionID, { twitter: { user } })
            redirect(301, '/register')


        }
    }

    redirect(300, '/register')

}) as PageServerLoad;
