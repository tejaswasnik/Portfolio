import { describe, expect, it } from "vitest";
import { profileSchema, profileFormSchema, bannerFormSchema } from "./profile.js";

describe("profileSchema", () => {
  const valid = {
    name: "Tejas Wasnik",
    tagline: "Building thoughtful software.",
    about: "I build things.",
    letsTalkHeading: "Let's talk",
    letsTalkSubtext: "Reach out any time.",
  };

  it("accepts minimal valid profile with defaulted social links", () => {
    const result = profileSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.socialLinks).toEqual({
        email: "",
        github: "",
        linkedin: "",
        twitter: "",
      });
    }
  });

  it("rejects an invalid github URL in socialLinks", () => {
    const result = profileSchema.safeParse({
      ...valid,
      socialLinks: { github: "not-a-url" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing tagline", () => {
    const { tagline, ...withoutTagline } = valid;
    const result = profileSchema.safeParse(withoutTagline);
    expect(result.success).toBe(false);
  });
});

describe("profileFormSchema (admin Profile & About form)", () => {
  const valid = {
    name: "Tejas Wasnik",
    tagline: "Building thoughtful software.",
    about: "I build things.",
    letsTalkHeading: "Let's talk",
    letsTalkSubtext: "Reach out any time.",
    footerText: "© 2026 Tejas Wasnik · Built with care.",
    githubUsername: "tejaswasnik",
  };

  it("accepts a valid combined payload", () => {
    expect(profileFormSchema.safeParse(valid).success).toBe(true);
  });

  it("allows an empty githubUsername (feature degrades, per step 8/step 11 wiring)", () => {
    expect(profileFormSchema.safeParse({ ...valid, githubUsername: "" }).success).toBe(true);
  });

  it("rejects an empty footerText (siteSettingsSchema requires one)", () => {
    expect(profileFormSchema.safeParse({ ...valid, footerText: "" }).success).toBe(false);
  });

  it("still enforces the underlying profile fields (e.g. a non-empty name)", () => {
    expect(profileFormSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("strips bannerUrl/bannerFileId rather than requiring or validating them (owned by the Banner screen)", () => {
    const result = profileFormSchema.safeParse({ ...valid, bannerUrl: "not-a-url" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).not.toHaveProperty("bannerUrl");
  });
});

describe("bannerFormSchema (admin Banner form)", () => {
  it("accepts a valid banner url and fileId", () => {
    const result = bannerFormSchema.safeParse({
      bannerUrl: "https://ik.imagekit.io/demo/banner.gif",
      bannerFileId: "abc123",
    });
    expect(result.success).toBe(true);
  });

  it("defaults both fields to empty (revert to placeholder)", () => {
    const result = bannerFormSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ bannerUrl: "", bannerFileId: "" });
    }
  });

  it("rejects an invalid bannerUrl", () => {
    expect(bannerFormSchema.safeParse({ bannerUrl: "not-a-url" }).success).toBe(false);
  });
});
