import { describe, expect, it, vi, beforeEach } from "vitest";
import { getContributionCalendar, heatLevel } from "./contributions.js";

describe("heatLevel", () => {
  it("buckets a count into 5 levels relative to the period max", () => {
    expect(heatLevel(0, 10)).toBe(0);
    expect(heatLevel(1, 10)).toBe(1);
    expect(heatLevel(2, 10)).toBe(1);
    expect(heatLevel(4, 10)).toBe(2);
    expect(heatLevel(6, 10)).toBe(3);
    expect(heatLevel(9, 10)).toBe(4);
  });

  it("treats a zero max as all-empty instead of dividing by zero", () => {
    expect(heatLevel(0, 0)).toBe(0);
  });
});

describe("getContributionCalendar", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns null without a GITHUB_TOKEN, never calling fetch", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await getContributionCalendar("octocat");
    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns null without a username, never calling fetch", async () => {
    vi.stubEnv("GITHUB_TOKEN", "token");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await getContributionCalendar(undefined);
    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns null when the API responds with a non-ok status", async () => {
    vi.stubEnv("GITHUB_TOKEN", "token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false });
    const result = await getContributionCalendar("octocat");
    expect(result).toBeNull();
  });

  it("returns null when fetch itself throws (network error)", async () => {
    vi.stubEnv("GITHUB_TOKEN", "token");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
    const result = await getContributionCalendar("octocat");
    expect(result).toBeNull();
  });

  it("maps a successful response into { weeks: [{ days }] }", async () => {
    vi.stubEnv("GITHUB_TOKEN", "token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          user: {
            contributionsCollection: {
              contributionCalendar: {
                weeks: [
                  {
                    contributionDays: [
                      { date: "2026-01-01", contributionCount: 3 },
                    ],
                  },
                ],
              },
            },
          },
        },
      }),
    });

    const result = await getContributionCalendar("octocat");
    expect(result).toEqual({
      weeks: [{ days: [{ date: "2026-01-01", count: 3 }] }],
    });
  });
});
