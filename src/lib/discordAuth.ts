import { DISCORD_AUTH, DISCORD_ID } from "$env/static/private"

let auth = DISCORD_AUTH;
let id = DISCORD_ID;

interface IJsonResponse {
  access_token: string;
}

interface IUserResponse {
  user: object;
}

async function wrongAnswer(discordResponse: Response) {
  const errorDetail = await discordResponse.text();
  return {
    error: "Failed to fetch access token",
    status: discordResponse.status,
    detail: errorDetail,
  };
}

export async function getDiscordAuth(code: string) {
  if (!code) {
    return { error: "No authorization code provided" };
  }

  const postOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: id,
      client_secret: auth,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: "http://localhost:5173/register/discordResponse",
    }),
  };

  try {
    // Request to exchange the authorization code for an access token
    const discordResponse = await fetch("https://discord.com/api/oauth2/token", postOptions);

    // if (!discordResponse.ok) {
    //   console.log('processing null existence of discordResponse.ok')
    //   wrongAnswer(discordResponse);
    // }

    const jsonResponse: IJsonResponse = await discordResponse.json();

    if (!jsonResponse.access_token) {
      return { error: "Access token is missing from the response" };
    }

    const token = jsonResponse.access_token;

    // Request to fetch user data with the obtained access token
    const getUserOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const getUserResponse = await fetch("https://discord.com/api/oauth2/@me", getUserOptions);

    if (!getUserResponse.ok) {
      wrongAnswer(getUserResponse)
    }

    const jsonGetUserResponse: IUserResponse = await getUserResponse.json();

    if (!jsonGetUserResponse.user) {
      return { error: "User data is missing from the response" };
    }

    return { user: jsonGetUserResponse.user };

  } catch (e) {
    // Catch any errors related to the fetch process or JSON parsing
    console.error("Error during Discord authentication process:", e);
    return {
      error: "An error occurred during the authentication process",
      detail: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
export function discordError(discordUserResponse: { error: any; status: any; detail: any; }) {
  console.error("Discord Authentication Error:", discordUserResponse.error);

  // Optional: Log additional details about the error if they exist
  if (discordUserResponse.status) {
    console.log("Status code:", discordUserResponse.status);
  }
  if (discordUserResponse.detail) {
    console.log("Error details:", discordUserResponse.detail);
  }

  // Return the error to the frontend to display the error message
  return {
    error: discordUserResponse.error,
    status: discordUserResponse.status || null,
    detail: discordUserResponse.detail || null
  };
}