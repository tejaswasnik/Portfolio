import { getClient } from "../src/lib/db/client.js";
import { COLLECTIONS } from "../src/lib/db/collections/names.js";

// Events are kept for 24 months per docs/PRD.md §3.2 ("12-24 months");
// chose the upper bound.
const EVENTS_TTL_SECONDS = 60 * 60 * 24 * 365 * 2;

async function ensureIndexes() {
  const client = await getClient();
  const db = client.db();

  await db.collection(COLLECTIONS.projects).createIndex({ slug: 1 }, { unique: true });

  await db
    .collection(COLLECTIONS.events)
    .createIndex({ createdAt: 1 }, { expireAfterSeconds: EVENTS_TTL_SECONDS });
  await db.collection(COLLECTIONS.events).createIndex({ path: 1, createdAt: -1 });

  await db.collection(COLLECTIONS.messages).createIndex({ createdAt: -1 });

  await db
    .collection(COLLECTIONS.rateLimits)
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  await client.close();
}

ensureIndexes()
  .then(() => {
    console.log("Indexes ensured.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to ensure indexes:", error);
    process.exit(1);
  });
