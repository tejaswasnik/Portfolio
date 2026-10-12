import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteUrl } from "./site-url.js";

describe("getSiteUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("falls back to localhost when SITE_URL is unset", () => {
    vi.stubEnv("SITE_URL", "");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("returns the configured origin", () => {
    vi.stubEnv("SITE_URL", "https://tejaswasnik.dev");
    expect(getSiteUrl()).toBe("https://tejaswasnik.dev");
  });

  it("strips a trailing slash", () => {
    vi.stubEnv("SITE_URL", "https://tejaswasnik.dev/");
    expect(getSiteUrl()).toBe("https://tejaswasnik.dev");
  });
});
