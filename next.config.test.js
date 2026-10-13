import { describe, expect, it } from "vitest";
import nextConfig from "./next.config.mjs";

describe("security headers", () => {
  it("ships a Content-Security-Policy scoped to known external origins", async () => {
    const [{ headers }] = await nextConfig.headers();
    const csp = headers.find((h) => h.key === "Content-Security-Policy");

    expect(csp).toBeDefined();
    expect(csp.value).toContain("default-src 'self'");
    expect(csp.value).toContain("https://ik.imagekit.io");
    expect(csp.value).toContain("https://upload.imagekit.io");
    expect(csp.value).not.toContain("*");
  });
});
