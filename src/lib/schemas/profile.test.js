import { describe, expect, it } from "vitest";
import { profileSchema, profileFormSchema } from "./profile.js";

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
});
