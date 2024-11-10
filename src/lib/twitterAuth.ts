import { auth, Client } from "twitter-api-sdk";
import { TWITTER_KEY, TWITTER_SECRET } from '$env/static/private';

let twitter = {
    key: TWITTER_KEY,
    secret: TWITTER_SECRET,
};


let twitterAuth = new auth.OAuth2User({
    client_id: twitter.key,
    client_secret: twitter.secret,
    callback: "http://localhost:5173/register/twitter",
    scopes: ["users.read", "tweet.read"],
});


export function getTwitterRedirectUrl(session: string) {

    let authUrl
    return authUrl = twitterAuth.generateAuthURL({
        state: session,
        code_challenge_method: "s256"
    })
}


export async function handleTwitterCallback(state: string, code: string, sessionID: string) {
    // Verify that the state matches the session ID for security
    if (state !== sessionID) {
        throw new Error("Invalid state parameter");
    }

    try {
        // Exchange the authorization code for an access token
        const tokenResponse = await twitterAuth.requestAccessToken(code);
        console.log("Access token obtained:", tokenResponse);

        // Initialize the Twitter API client with the access token
        const twitterClient = new Client(twitterAuth);

        // Fetch the authenticated user's data
        const userData = await twitterClient.users.findMyUser();
        console.log("User data obtained:", userData);

        // Return user data
        return { userData, tokenResponse };
    } catch (error) {
        console.error("Error during Twitter callback handling:", error);
        throw new Error("Failed to retrieve user data");
    }
}