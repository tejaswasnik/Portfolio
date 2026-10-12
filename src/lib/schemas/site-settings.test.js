import { describe, expect, it } from "vitest";
import { siteSettingsSchema, settingsFormSchema, maintenanceToggleSchema } from "./site-settings.js";

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

describe("settingsFormSchema (admin Settings form)", () => {
  const valid = {
    title: "Tejas Wasnik",
    description: "Personal portfolio.",
    notificationEmail: "owner@example.com",
    adminEmail: "owner@example.com",
  };

  it("accepts a valid combined payload", () => {
    expect(settingsFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid adminEmail", () => {
    expect(settingsFormSchema.safeParse({ ...valid, adminEmail: "nope" }).success).toBe(false);
  });

  it("strips footerText/githubUsername/maintenanceMode rather than requiring or validating them (owned elsewhere)", () => {
    const result = settingsFormSchema.safeParse({ ...valid, maintenanceMode: "not-a-bool" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).not.toHaveProperty("maintenanceMode");
  });
});

describe("maintenanceToggleSchema (admin Settings instant toggle)", () => {
  it("accepts a boolean value", () => {
    expect(maintenanceToggleSchema.safeParse({ value: true }).success).toBe(true);
  });

  it("rejects a non-boolean value", () => {
    expect(maintenanceToggleSchema.safeParse({ value: "yes" }).success).toBe(false);
  });
});
