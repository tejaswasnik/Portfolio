import dns from "dns";
import { MongoClient } from "mongodb";
import { getEnv } from "../env.js";

// System DNS can't always resolve *.mongodb.net (Atlas hostnames).
// Force Google's public resolvers, mirroring the workaround in
// scripts/seed-admin.js so the app server behaves the same way.
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch {
  // Ignore in environments where setServers is restricted
}

// Clear any stale/rejected connection cached from prior failed attempts
if (process.env.NODE_ENV === "development") {
  delete globalThis._mongoClientPromise;
}

/** @type {Promise<MongoClient> | undefined} */
let clientPromise;

function createClientPromise() {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch {}
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
      globalThis._mongoClientPromise = createClientPromise().catch((err) => {
        delete globalThis._mongoClientPromise;
        throw err;
      });
    }
    return globalThis._mongoClientPromise;
  }

  if (!clientPromise) {
    clientPromise = createClientPromise().catch((err) => {
      clientPromise = undefined;
      throw err;
    });
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
