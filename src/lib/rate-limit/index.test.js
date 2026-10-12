import { describe, expect, it, vi } from "vitest";
import { checkAndIncrementRateLimit } from "./index.js";

/** Builds a fake db whose rateLimits collection's findOneAndUpdate
 * returns a document with the given count, as the real atomic upsert
 * would after incrementing. */
function fakeDb(count) {
  const findOneAndUpdate = vi.fn().mockResolvedValue({ count });
  return {
    db: { collection: () => ({ findOneAndUpdate }) },
    findOneAndUpdate,
  };
}

describe("checkAndIncrementRateLimit", () => {
  it("allows the 1st through 3rd request in a window", async () => {
    for (const count of [1, 2, 3]) {
      const { db } = fakeDb(count);
      await expect(checkAndIncrementRateLimit(db, "hash")).resolves.toBe(true);
    }
  });

  it("rejects the 4th request within the same window", async () => {
    const { db } = fakeDb(4);
    await expect(checkAndIncrementRateLimit(db, "hash")).resolves.toBe(false);
  });

  it("queries only non-expired windows and upserts atomically", async () => {
    const { db, findOneAndUpdate } = fakeDb(1);
    await checkAndIncrementRateLimit(db, "hash-key");

    const [filter, update, options] = findOneAndUpdate.mock.calls[0];
    expect(filter.key).toBe("hash-key");
    expect(filter.expiresAt.$gt).toBeInstanceOf(Date);
    expect(update.$inc).toEqual({ count: 1 });
    expect(update.$setOnInsert.key).toBe("hash-key");
    expect(options.upsert).toBe(true);
  });
});
