import { db } from '../hooks.server.js'

export async function isDiscordUnique(username: string): Promise<boolean> {
    const unique = await db.collection('_users').distinct('discord');
    if (!unique) return false;
    return !unique.includes(username);
}


export async function knownDiscordUsername(username: string): Promise<boolean> {
    return !(await isAccountUnique(username));
}

export async function isTwitterUnique(username: string): Promise<boolean> {
    const unique = await db.collection('_users').distinct('twitter');
    if (!unique) return false;
    return !unique.includes(username);
}

export async function isAccountUnique(username: string): Promise<boolean> {
    const unique = await db.collection('_users').distinct('account');
    if (!unique) return false;
    return !unique.includes(username);
    //isAccountUnique returns true if it does not exist in database, and false if it does not.
    // alternative name is AccountIsUnknown
}
