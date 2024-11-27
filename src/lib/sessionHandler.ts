// src/lib/databasefunctions.ts
import { db } from '../hooks.server'
import { ObjectId } from 'mongodb';
import type { UpdateResult } from 'mongodb';
import type { CookieSerializeOptions } from 'cookie';

export interface SessionData {
    _id?: ObjectId;
    sessionId: string;
    stage?: string;
    walletAddress?: string;
    discord?: string | any;
    twitter?: partialTwitter;
    signedMessage?: string;
}

export interface partialTwitter {
    userData: { data: { id: string, username: string, name: string } }
    tokenResponse?: any;
}

// Store session data in the database
export async function updateSessionData(sessionId: string, data: Partial<SessionData>): Promise<UpdateResult<SessionData>> {
    const database = db.collection<SessionData>('_sessions');
    let updated = await database.updateOne(
        { "sessionId": { $eq: sessionId } },
        { $set: data },
        { upsert: true }
    );

    return updated
}

// Retrieve session data from the database
export async function getSessionData(sessionId: string): Promise<SessionData | null> {
    const database = db.collection<SessionData>('_sessions');
    let result = await database.findOne({ sessionId: sessionId }) as SessionData;
    if (!result) return null
    delete result._id
    return result
}

class SessionId {
    id: string;

    constructor() {
        this.id = this.generateSessionId();
    }

    private generateSessionId(): string {
        return Math.random().toString(16).substring(2, 10);
    }
}

export let cookieOptions: CookieSerializeOptions & { path: string } = {
    httpOnly: true,  // Ensures cookie can't be accessed via client-side JavaScript
    path: '/',       // Explicitly defined as a string
    maxAge: 60 * 60 * 24 * 7, // 1 week expiration
    sameSite: 'lax', // Correctly typed as 'lax'
    secure: false
};

export async function createSession(cookies: { set: (arg0: string, arg1: string, arg2: CookieSerializeOptions & { path: string; }) => void; }) {
    const session = new SessionId();
    let sessionID = session.id;
    let session_id;
    // Set the new sessionId in cookies with appropriate options (e.g., HTTP-only, expiration)
    cookies.set('sessionID', sessionID, cookieOptions);
    let sessionUpdate = await updateSessionData(sessionID, { stage: "session-valid" })
    if (sessionUpdate.upsertedId) session_id = sessionUpdate.upsertedId.toString()
    cookies.set('session_id', session_id as string, cookieOptions)
    return { sessionID }
}