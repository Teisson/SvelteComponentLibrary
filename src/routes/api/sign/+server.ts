import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSessionData } from '$lib/sessionHandler';
import { config, verifyMessage } from '$lib/wallet';


export const POST: RequestHandler = async ({ request }) => {
    const { message, signature } = await request.json();

    // Process the message and signature as needed
    console.log('Message:', message);
    console.log('Signature:', signature);

    // split message into parts separated by # and $
    let msg = message.split(';');
    let usernames = msg[0].split(':');
    let account = msg[1]

    // Check if the signature is valid
    console.log('Usersnames:', usernames[0], usernames[1]);
    console.log('Account:', account);


    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
        cookieHeader.split('; ').map((c) => c.split('=').map(decodeURIComponent))
    );


    const sessionID = cookies['session_id'];
    console.log('SessionID', sessionID);

    let sessionData = await getSessionData(sessionID);


    let valid = await verifyMessage(config, {
        address: account,
        message,
        signature
    })

    if (!valid) {
        return error(400, 'Invalid signature');
    }

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
