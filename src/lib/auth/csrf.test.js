import { describe, expect, it } from "vitest";
import { isSameOriginRequest } from "./csrf.js";

function requestWithOrigin(origin) {
  const headers = origin ? { origin } : {};
  return new Request("http://localhost/api/admin/login", { method: "POST", headers });
}

describe("isSameOriginRequest", () => {
  it("accepts a matching Origin header", () => {
    expect(isSameOriginRequest(requestWithOrigin("http://localhost"))).toBe(true);
  });

  it("rejects a cross-origin Origin header", () => {
    expect(isSameOriginRequest(requestWithOrigin("https://evil.example"))).toBe(false);
  });

  it("rejects a missing Origin header", () => {
    expect(isSameOriginRequest(requestWithOrigin())).toBe(false);
  });

  it("rejects a malformed Origin header", () => {
    expect(isSameOriginRequest(requestWithOrigin("not-a-url"))).toBe(false);
  });
});
