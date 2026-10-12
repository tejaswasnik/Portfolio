import { describe, expect, it } from "vitest";
import { contactFormSchema, honeypotFieldName, messageSchema } from "./message.js";

describe("contactFormSchema", () => {
  const base = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    subject: "Let's collaborate",
    message: "I enjoyed your portfolio.",
  };

  it("accepts a valid submission with an empty honeypot", () => {
    const result = contactFormSchema.safeParse({
      ...base,
      [honeypotFieldName]: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a submission with no subject", () => {
    const { subject, ...withoutSubject } = base;
    const result = contactFormSchema.safeParse(withoutSubject);
    expect(result.success).toBe(true);
  });

  it("rejects a filled-in honeypot (bot submission)", () => {
    const result = contactFormSchema.safeParse({
      ...base,
      [honeypotFieldName]: "I am a bot",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = contactFormSchema.safeParse({ ...base, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty message", () => {
    const result = contactFormSchema.safeParse({ ...base, message: "" });
    expect(result.success).toBe(false);
  });
});

describe("messageSchema", () => {
  it("accepts a stored message document", () => {
    const result = messageSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello!",
      ipHash: "abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a document missing ipHash", () => {
    const result = messageSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello!",
    });
    expect(result.success).toBe(false);
  });
});
