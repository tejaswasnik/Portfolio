import { describe, expect, it } from "vitest";
import { siteSettingsSchema } from "./site-settings.js";

describe("siteSettingsSchema", () => {
  const valid = {
    title: "Tejas Wasnik",
    description: "Personal portfolio.",
    notificationEmail: "owner@example.com",
    footerText: "© 2026 Tejas Wasnik.",
  };

  it("accepts minimal valid settings with defaults applied", () => {
    const result = siteSettingsSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.maintenanceMode).toBe(false);
      expect(result.data.githubUsername).toBe("");
    }
  });

  it("rejects an invalid notificationEmail", () => {
    const result = siteSettingsSchema.safeParse({
      ...valid,
      notificationEmail: "nope",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing title", () => {
    const { title, ...withoutTitle } = valid;
    const result = siteSettingsSchema.safeParse(withoutTitle);
    expect(result.success).toBe(false);
  });
});
