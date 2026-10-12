import { describe, expect, it } from "vitest";
import { filterAdminMessages } from "./messages.js";

describe("filterAdminMessages (admin /admin/messages toolbar filters)", () => {
  const messages = [
    { name: "Aarav S.", email: "aarav@example.com", subject: "React project", message: "Hi there", read: false, archived: false },
    { name: "Meera K.", email: "meera@studio.example", subject: "Dashboard", message: "SaaS analytics", read: true, archived: false },
    { name: "Lucas W.", email: "lucas@oss.example", subject: "Hello", message: "Nice portfolio", read: true, archived: true },
  ];

  it("returns every message when no filters are given", () => {
    expect(filterAdminMessages(messages)).toHaveLength(3);
    expect(filterAdminMessages(messages, {})).toHaveLength(3);
  });

  it("'all' includes archived messages too", () => {
    expect(filterAdminMessages(messages, { filter: "all" })).toHaveLength(3);
  });

  it("'unread' excludes read and archived messages", () => {
    const result = filterAdminMessages(messages, { filter: "unread" });
    expect(result.map((m) => m.name)).toEqual(["Aarav S."]);
  });

  it("'archived' only returns archived messages", () => {
    const result = filterAdminMessages(messages, { filter: "archived" });
    expect(result.map((m) => m.name)).toEqual(["Lucas W."]);
  });

  it("narrows by search text across name/email/subject/message", () => {
    expect(filterAdminMessages(messages, { search: "dashboard" }).map((m) => m.name)).toEqual([
      "Meera K.",
    ]);
    expect(filterAdminMessages(messages, { search: "studio.example" }).map((m) => m.name)).toEqual([
      "Meera K.",
    ]);
  });

  it("combines search and filter (AND, not OR)", () => {
    const result = filterAdminMessages(messages, { search: "portfolio", filter: "archived" });
    expect(result.map((m) => m.name)).toEqual(["Lucas W."]);
  });
});
