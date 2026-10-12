import { describe, expect, it } from "vitest";
import { profileSchema } from "./profile.js";

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
