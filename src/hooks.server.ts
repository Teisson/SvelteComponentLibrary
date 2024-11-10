import type { Db } from 'mongodb';
import { MongoClient } from 'mongodb'
import { MONGODB } from '$env/static/private';

let client: MongoClient;
export let db: Db;

async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(MONGODB);
        try {
            await client.connect();
            db = client.db(); // You can specify the database name if needed
        } catch (err) {
            console.error("Failed to connect to MongoDB", err);
            throw err; // Handle the error appropriately
        }
    }
    return db;
}

export async function handle({ event, resolve }) {
    // Initialize database connection only once
    if (!client) await connectToDatabase();

    return await resolve(event);
}

await connectToDatabase(); // default connection