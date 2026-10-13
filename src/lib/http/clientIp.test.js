import { describe, expect, it } from "vitest";
import { getClientIp } from "./clientIp.js";

function requestWith(headers) {
  return new Request("http://localhost/", { headers });
}

describe("getClientIp", () => {
  it("prefers X-Real-IP when present", () => {
    const request = requestWith({ "x-real-ip": "203.0.113.9", "x-forwarded-for": "6.6.6.6" });
    expect(getClientIp(request)).toBe("203.0.113.9");
  });

  it("uses the last X-Forwarded-For hop, not the attacker-controlled first one", () => {
    const request = requestWith({ "x-forwarded-for": "6.6.6.6, 198.51.100.4" });
    expect(getClientIp(request)).toBe("198.51.100.4");
  });

  it("falls back to unknown with no identifying headers", () => {
    const request = requestWith({});
    expect(getClientIp(request)).toBe("unknown");
  });
});
