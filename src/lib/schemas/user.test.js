import { describe, expect, it } from "vitest";
import { loginSchema, userSchema, changePasswordSchema } from "./user.js";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "admin@example.com",
      password: "s3cret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "admin@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("userSchema", () => {
  it("accepts a valid stored user with defaults applied", () => {
    const result = userSchema.safeParse({
      email: "admin@example.com",
      passwordHash: "$2b$10$hash",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.failedAttempts).toBe(0);
      expect(result.data.tokenVersion).toBe(0);
    }
  });
});

describe("changePasswordSchema", () => {
  it("accepts matching new passwords of at least 12 characters", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "oldpassword",
      newPassword: "newpassword123",
      confirmPassword: "newpassword123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a new password under 12 characters", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "oldpassword",
      newPassword: "short1",
      confirmPassword: "short1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched new/confirm passwords", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "oldpassword",
      newPassword: "newpassword123",
      confirmPassword: "different1234",
    });
    expect(result.success).toBe(false);
  });
});
