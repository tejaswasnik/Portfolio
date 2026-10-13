import { getClient } from "../src/lib/db/client.js";
import { COLLECTIONS } from "../src/lib/db/collections/names.js";
import { pickPlacement } from "../src/lib/interestImages/placement.js";

// Matches the 7 "Image — … (replace fill)" placeholder layers in the
// Figma frame (5:5314 → 105:2) — names only, the actual positions below
// come from the same auto-placement algorithm the admin "Add image"
// button uses, per the task spec: "Figma is only the starting layout...
// number, size, position and rotation come from the database and the
// admin panel, not from the Figma values."
const PLACEHOLDER_NAMES = ["Poster", "Album", "Still", "Book", "Album", "Series", "Poster"];
const SIZE = { width: 160, height: 160 };

/**
 * Opt-in (`npm run seed:interests`), idempotent: does nothing if the
 * collection already has any documents, so running it twice (or on a
 * real site with real uploads already) never duplicates or overwrites
 * anything. The admin can delete these starter placeholders exactly like
 * any image they'd upload themselves — this is not a protected/fixed
 * set, matching "no required slot keys, no seeded records" by default.
 */
async function run() {
  const client = await getClient();
  const db = client.db();
  const collection = db.collection(COLLECTIONS.interestImages);

  const existingCount = await collection.countDocuments({});
  if (existingCount > 0) {
    await client.close();
    return { inserted: 0, reason: `already has ${existingCount} document(s)` };
  }

  const placed = [];
  const docs = [];
  let previousSide = null;
  const now = new Date();

  PLACEHOLDER_NAMES.forEach((name, index) => {
    const placement = pickPlacement({ size: SIZE, previousSide, existing: placed });
    placed.push({ offsetX: placement.offsetX, topPct: placement.topPct, ...SIZE });
    previousSide = placement.side;

    docs.push({
      imageUrl: `https://placehold.co/320x320/1a1d20/2e3337?text=${encodeURIComponent(name)}`,
      fileId: `seed-interest-image-${index}`,
      alt: "",
      ...SIZE,
      offsetX: placement.offsetX,
      topPct: placement.topPct,
      rotation: placement.rotation,
      visible: true,
      order: index,
      createdAt: now,
      updatedAt: now,
    });
  });

  await collection.insertMany(docs);
  await db.collection(COLLECTIONS.sections).updateOne(
    { key: "interest-images" },
    { $setOnInsert: { key: "interest-images", label: "Interest images", visible: true, order: 8 } },
    { upsert: true },
  );
  await client.close();
  return { inserted: docs.length };
}

run()
  .then(({ inserted, reason }) => {
    console.log(inserted > 0 ? `Seeded ${inserted} placeholder interest images.` : `Skipped — ${reason}.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed interest images:", error.message);
    process.exit(1);
  });
