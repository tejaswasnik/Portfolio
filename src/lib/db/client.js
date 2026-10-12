import { MongoClient } from "mongodb";
import { getEnv } from "../env.js";

/** @type {Promise<MongoClient> | undefined} */
let clientPromise;

function createClientPromise() {
  const { MONGODB_URI } = getEnv();
  const client = new MongoClient(MONGODB_URI);
  return client.connect();
}

/**
 * Returns a cached MongoClient connection. In development the promise is
 * stashed on `global` so Next.js's HMR module reloads reuse the same
 * connection instead of opening a new one on every edit. In production
 * (each serverless invocation gets a fresh module scope, but a warm
 * invocation reuses it) a module-level cache is enough.
 * @returns {Promise<MongoClient>}
 */
export function getClient() {
  if (process.env.NODE_ENV === "development") {
    if (!globalThis._mongoClientPromise) {
      globalThis._mongoClientPromise = createClientPromise();
    }
    return globalThis._mongoClientPromise;
  }

  if (!clientPromise) {
    clientPromise = createClientPromise();
  }
  return clientPromise;
}

/**
 * Returns the app's database handle. The database name comes from
 * MONGODB_URI's path segment, per standard Mongo connection strings.
 * @returns {Promise<import('mongodb').Db>}
 */
export async function getDb() {
  const client = await getClient();
  return client.db();
}
