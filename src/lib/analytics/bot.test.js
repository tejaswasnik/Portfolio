import { describe, expect, it } from "vitest";
import { isBot } from "./bot.js";

describe("isBot", () => {
  it("flags common crawlers", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBot("Mozilla/5.0 (compatible; bingbot/2.0)")).toBe(true);
    expect(isBot("facebookexternalhit/1.1")).toBe(true);
    expect(isBot("curl/8.1.2")).toBe(true);
  });

  it("flags a missing user agent", () => {
    expect(isBot("")).toBe(true);
    expect(isBot(null)).toBe(true);
    expect(isBot(undefined)).toBe(true);
  });

  it("does not flag a normal browser UA", () => {
    expect(
      isBot(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      ),
    ).toBe(false);
    expect(
      isBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15"),
    ).toBe(false);
  });
});
