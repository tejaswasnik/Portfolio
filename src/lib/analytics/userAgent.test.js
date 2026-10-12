import { describe, expect, it } from "vitest";
import { parseUserAgent } from "./userAgent.js";

describe("parseUserAgent", () => {
  it("detects desktop Chrome on Windows", () => {
    const result = parseUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );
    expect(result).toEqual({ device: "Desktop", browser: "Chrome", os: "Windows" });
  });

  it("detects mobile Safari on iOS", () => {
    const result = parseUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    );
    expect(result).toEqual({ device: "Mobile", browser: "Safari", os: "iOS" });
  });

  it("detects desktop Safari on macOS", () => {
    const result = parseUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    );
    expect(result).toEqual({ device: "Desktop", browser: "Safari", os: "macOS" });
  });

  it("detects Android mobile Chrome", () => {
    const result = parseUserAgent(
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36",
    );
    expect(result).toEqual({ device: "Mobile", browser: "Chrome", os: "Android" });
  });

  it("detects Firefox on Linux desktop", () => {
    const result = parseUserAgent("Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0");
    expect(result).toEqual({ device: "Desktop", browser: "Firefox", os: "Linux" });
  });

  it("falls back gracefully for an empty/unknown UA", () => {
    expect(parseUserAgent("")).toEqual({ device: "Desktop", browser: "Other", os: "Other" });
    expect(parseUserAgent(null)).toEqual({ device: "Desktop", browser: "Other", os: "Other" });
  });
});
