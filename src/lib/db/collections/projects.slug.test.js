import { describe, expect, it, vi } from "vitest";
import { findPublicProjectBySlug } from "./projects.js";

/** Minimal duck-typed stand-in for a Mongo `Db` — no real connection. */
function fakeDb(findOneResult) {
  const findOne = vi.fn().mockResolvedValue(findOneResult);
  return { db: { collection: () => ({ findOne }) }, findOne };
}

describe("findPublicProjectBySlug (unpublished must 404)", () => {
  it("queries by slug AND published:true, never slug alone", async () => {
    const { db, findOne } = fakeDb(null);
    await findPublicProjectBySlug(db, "fieldnote");
    expect(findOne).toHaveBeenCalledWith({ slug: "fieldnote", published: true });
  });

  it("resolves null for a slug that doesn't exist at all", async () => {
    const { db } = fakeDb(null);
    await expect(findPublicProjectBySlug(db, "does-not-exist")).resolves.toBeNull();
  });

  it("resolves null for an existing-but-unpublished slug, same as a missing one", async () => {
    // The query filter (published: true) is what makes Mongo itself return
    // null here even though a document with this slug exists — asserted
    // above. The caller (the [slug] page) must treat both cases as 404.
    const { db } = fakeDb(null);
    await expect(findPublicProjectBySlug(db, "unpublished-project")).resolves.toBeNull();
  });

  it("resolves the document for a published slug that matches", async () => {
    const doc = { slug: "fieldnote", published: true, name: "Fieldnote" };
    const { db } = fakeDb(doc);
    await expect(findPublicProjectBySlug(db, "fieldnote")).resolves.toEqual(doc);
  });
});
