import type { PageServerLoad } from './$types';
import { updateSessionData, getSessionData, createSession, cookieOptions } from '$lib/sessionHandler'
import { error } from '@sveltejs/kit'
import { getTwitterRedirectUrl } from '$lib/twitterAuth';

export const load = (async ({ params, locals, cookies }) => {
    let sessionID = cookies.get('sessionID') as string | undefined;
    let session_id = cookies.get('session_id') as string | undefined;
    let sessionData = null
    let twitterRedirectURL;


    if (!sessionID) {
        let { sessionID } = await createSession(cookies)
        if (sessionID) {
            twitterRedirectURL = getTwitterRedirectUrl(sessionID);
        }
    }

    if (sessionID) twitterRedirectURL = getTwitterRedirectUrl(sessionID)

    if (session_id && sessionID) {
        try {
            cookies.set('session_id', session_id, cookieOptions)
            cookies.set('sessionID', sessionID, cookieOptions)
            sessionData = await getSessionData(sessionID)
        }
        catch (e) {
            console.log('e:', e)
        }
    }

    if (sessionData?.twitter && sessionData?.discord && sessionID) updateSessionData(sessionID, { stage: "authenticated" })

    return {
        ...sessionData,
        twitterRedirectURL
    };
}) satisfies PageServerLoad;