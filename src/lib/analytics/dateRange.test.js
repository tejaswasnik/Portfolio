import { describe, expect, it } from "vitest";
import { resolveDateRange } from "./dateRange.js";

const NOW = new Date("2026-10-12T15:00:00.000Z");

describe("resolveDateRange", () => {
  it("defaults to a 30-day range ending today", () => {
    const result = resolveDateRange({}, NOW);
    expect(result.range).toBe("30");
    expect(result.days).toBe(30);
    expect(result.start.toISOString().slice(0, 10)).toBe("2026-09-13");
    expect(result.end.toISOString().slice(0, 10)).toBe("2026-10-12");
  });

  it("supports 7 and 90 day ranges", () => {
    expect(resolveDateRange({ range: "7" }, NOW).days).toBe(7);
    expect(resolveDateRange({ range: "90" }, NOW).days).toBe(90);
  });

  it("the previous period is the same length, immediately before the current one", () => {
    const result = resolveDateRange({ range: "7" }, NOW);
    const lengthMs = result.end.getTime() - result.start.getTime();
    const prevLengthMs = result.prevEnd.getTime() - result.prevStart.getTime();
    expect(Math.round(prevLengthMs / 1000)).toBe(Math.round(lengthMs / 1000));
    expect(result.prevEnd.getTime()).toBeLessThan(result.start.getTime());
  });

  it("supports a custom from/to range", () => {
    const result = resolveDateRange({ range: "custom", from: "2026-10-01", to: "2026-10-05" }, NOW);
    expect(result.start.toISOString().slice(0, 10)).toBe("2026-10-01");
    expect(result.end.toISOString().slice(0, 10)).toBe("2026-10-05");
    expect(result.days).toBe(5);
  });

  it("falls back to 30 days when 'custom' is requested without valid from/to", () => {
    const result = resolveDateRange({ range: "custom" }, NOW);
    expect(result.days).toBe(30);
  });

  it("rejects an unknown range value, falling back to 30", () => {
    expect(resolveDateRange({ range: "nope" }, NOW).range).toBe("30");
  });
});
