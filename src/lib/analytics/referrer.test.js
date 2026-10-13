import { describe, expect, it } from "vitest";
import { normalizeReferrer } from "./referrer.js";

describe("normalizeReferrer", () => {
  it("returns 'Direct' for an empty referrer", () => {
    expect(normalizeReferrer("", "https://tejaswasnik.me")).toBe("Direct");
  });

  it("returns 'Direct' for a same-origin referrer", () => {
    expect(normalizeReferrer("https://tejaswasnik.me/projects", "https://tejaswasnik.me")).toBe(
      "Direct",
    );
  });

  it("maps known hosts to friendly labels", () => {
    expect(normalizeReferrer("https://www.google.com/search?q=x", "https://tejaswasnik.me")).toBe(
      "Google",
    );
    expect(normalizeReferrer("https://www.linkedin.com/feed", "https://tejaswasnik.me")).toBe(
      "LinkedIn",
    );
    expect(normalizeReferrer("https://t.co/abc123", "https://tejaswasnik.me")).toBe("X");
  });

  it("falls back to the bare hostname for an unrecognized referrer", () => {
    expect(normalizeReferrer("https://news.ycombinator.com/item?id=1", "https://tejaswasnik.me")).toBe(
      "news.ycombinator.com",
    );
  });

  it("returns 'Direct' for a malformed referrer rather than throwing", () => {
    expect(normalizeReferrer("not-a-url", "https://tejaswasnik.me")).toBe("Direct");
  });
});
