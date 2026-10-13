import { describe, expect, it } from "vitest";
import {
  computeOverviewStats,
  computeViewsOverTime,
  computeTopPages,
  computeTopReferrers,
  computeCountries,
  computeDeviceBreakdown,
  computeClickTracking,
  classifyTarget,
  computeRecentActivity,
} from "./aggregations.js";

/** A view event fixture, with sensible defaults. */
function view(overrides) {
  return {
    type: "view",
    path: "/",
    referrer: "",
    country: "IN",
    device: "Desktop",
    browser: "Chrome",
    os: "Windows",
    visitorHash: "visitor-1",
    createdAt: "2026-10-10T12:00:00.000Z",
    ...overrides,
  };
}

/** A click event fixture. */
function click(overrides) {
  return {
    type: "click",
    path: "/",
    target: "GitHub profile",
    visitorHash: "visitor-1",
    createdAt: "2026-10-10T12:00:00.000Z",
    ...overrides,
  };
}

describe("computeOverviewStats", () => {
  it("counts views, unique visitors, messages, and computes deltas vs. the previous period", () => {
    const currentEvents = [
      view({ visitorHash: "a" }),
      view({ visitorHash: "a" }),
      view({ visitorHash: "b" }),
    ];
    const previousEvents = [view({ visitorHash: "a" })];

    const result = computeOverviewStats({
      currentEvents,
      previousEvents,
      currentMessageCount: 2,
      previousMessageCount: 1,
    });

    expect(result.pageViews).toEqual({ value: 3, deltaPct: 200 });
    expect(result.uniqueVisitors).toEqual({ value: 2, deltaPct: 100 });
    expect(result.messages).toEqual({ value: 2, deltaPct: 100 });
  });

  it("handles a zero previous period without dividing by zero", () => {
    const result = computeOverviewStats({
      currentEvents: [view()],
      previousEvents: [],
      currentMessageCount: 1,
      previousMessageCount: 0,
    });
    expect(result.pageViews.deltaPct).toBeNull();
    expect(result.messages.deltaPct).toBeNull();
  });

  it("reports 0% delta when both periods are zero", () => {
    const result = computeOverviewStats({
      currentEvents: [],
      previousEvents: [],
      currentMessageCount: 0,
      previousMessageCount: 0,
    });
    expect(result.pageViews).toEqual({ value: 0, deltaPct: 0 });
  });

  it("computes contact conversion as messages / unique visitors", () => {
    const result = computeOverviewStats({
      currentEvents: [view({ visitorHash: "a" }), view({ visitorHash: "b" })],
      previousEvents: [],
      currentMessageCount: 1,
      previousMessageCount: 0,
    });
    expect(result.contactConversion.value).toBe(50);
  });

  it("only counts type:view events toward pageViews/visitors (clicks excluded)", () => {
    const result = computeOverviewStats({
      currentEvents: [view(), click()],
      previousEvents: [],
      currentMessageCount: 0,
      previousMessageCount: 0,
    });
    expect(result.pageViews.value).toBe(1);
  });
});

describe("computeViewsOverTime", () => {
  it("returns one row per day in range, with views and unique visitors", () => {
    const events = [
      view({ createdAt: "2026-10-10T08:00:00.000Z", visitorHash: "a" }),
      view({ createdAt: "2026-10-10T20:00:00.000Z", visitorHash: "a" }),
      view({ createdAt: "2026-10-11T09:00:00.000Z", visitorHash: "b" }),
    ];

    const result = computeViewsOverTime(events, "2026-10-10", "2026-10-12");

    expect(result).toEqual([
      { date: "2026-10-10", views: 2, uniqueVisitors: 1 },
      { date: "2026-10-11", views: 1, uniqueVisitors: 1 },
      { date: "2026-10-12", views: 0, uniqueVisitors: 0 },
    ]);
  });

  it("ignores click events and events outside the requested range", () => {
    const events = [
      view({ createdAt: "2026-10-09T23:59:59.000Z", visitorHash: "outside-before" }),
      view({ createdAt: "2026-10-10T08:00:00.000Z", visitorHash: "a" }),
      { ...view({ createdAt: "2026-10-10T09:00:00.000Z", visitorHash: "a" }), type: "click" },
      view({ createdAt: "2026-10-13T00:00:00.000Z", visitorHash: "outside-after" }),
    ];

    const result = computeViewsOverTime(events, "2026-10-10", "2026-10-10");

    expect(result).toEqual([{ date: "2026-10-10", views: 1, uniqueVisitors: 1 }]);
  });
});

describe("computeTopPages", () => {
  it("ranks paths by view count and buckets the rest as 'Other pages'", () => {
    const events = [
      view({ path: "/" }),
      view({ path: "/" }),
      view({ path: "/projects" }),
      view({ path: "/projects/workspace" }),
      view({ path: "/projects/fieldnote" }),
    ];

    const result = computeTopPages(events, 2);

    expect(result).toEqual([
      { path: "/", views: 2 },
      { path: "/projects", views: 1 },
      { path: "Other pages", views: 2 },
    ]);
  });

  it("omits the 'Other pages' row when everything fits within the limit", () => {
    const result = computeTopPages([view({ path: "/" })], 5);
    expect(result).toEqual([{ path: "/", views: 1 }]);
  });
});

describe("computeTopReferrers", () => {
  it("groups by normalized referrer label, sorted desc", () => {
    const events = [
      view({ referrer: "" }),
      view({ referrer: "https://www.google.com/search" }),
      view({ referrer: "https://www.google.com/search" }),
    ];
    const result = computeTopReferrers(events, "https://tejaswasnik.me");
    expect(result).toEqual([
      { referrer: "Google", visits: 2 },
      { referrer: "Direct", visits: 1 },
    ]);
  });
});

describe("computeCountries", () => {
  it("counts unique visitors per country, sorted desc", () => {
    const events = [
      view({ country: "IN", visitorHash: "a" }),
      view({ country: "IN", visitorHash: "a" }),
      view({ country: "IN", visitorHash: "b" }),
      view({ country: "US", visitorHash: "c" }),
    ];
    const result = computeCountries(events);
    expect(result).toEqual([
      { code: "IN", country: "India", visitors: 2 },
      { code: "US", country: "United States", visitors: 1 },
    ]);
  });

  it("skips events with no country", () => {
    const result = computeCountries([view({ country: "" })]);
    expect(result).toEqual([]);
  });
});

describe("computeDeviceBreakdown", () => {
  it("computes device/browser/os shares that sum to 100%", () => {
    const events = [
      view({ device: "Desktop", browser: "Chrome", os: "Windows" }),
      view({ device: "Desktop", browser: "Chrome", os: "Windows" }),
      view({ device: "Mobile", browser: "Safari", os: "iOS" }),
      view({ device: "Mobile", browser: "Safari", os: "iOS" }),
    ];
    const result = computeDeviceBreakdown(events);
    expect(result.devices).toEqual([
      { label: "Desktop", count: 2, pct: 50 },
      { label: "Mobile", count: 2, pct: 50 },
    ]);
  });
});

describe("classifyTarget / computeClickTracking", () => {
  it("classifies known target strings into Social/CTA/File/Project", () => {
    expect(classifyTarget("GitHub profile")).toBe("Social");
    expect(classifyTarget("LinkedIn")).toBe("Social");
    expect(classifyTarget("X")).toBe("Social");
    expect(classifyTarget("Contact button")).toBe("CTA");
    expect(classifyTarget("Resume download")).toBe("File");
    expect(classifyTarget("Workspace · live link")).toBe("Project");
    expect(classifyTarget("something-unknown")).toBe("Other");
  });

  it("ranks click targets by count with their type", () => {
    const events = [
      click({ target: "GitHub profile" }),
      click({ target: "GitHub profile" }),
      click({ target: "Resume download" }),
    ];
    const result = computeClickTracking(events);
    expect(result).toEqual([
      { target: "GitHub profile", type: "Social", clicks: 2 },
      { target: "Resume download", type: "File", clicks: 1 },
    ]);
  });

  it("only counts type:click events (views excluded)", () => {
    const result = computeClickTracking([view(), click({ target: "Contact button" })]);
    expect(result).toEqual([{ target: "Contact button", type: "CTA", clicks: 1 }]);
  });
});

describe("computeRecentActivity", () => {
  it("merges messages and notable click events, newest first", () => {
    const messages = [{ name: "Ada", subject: "Hi", createdAt: "2026-10-10T10:00:00.000Z" }];
    const events = [
      click({ target: "Resume download", country: "IN", createdAt: "2026-10-10T12:00:00.000Z" }),
      click({ target: "GitHub profile", createdAt: "2026-10-10T13:00:00.000Z" }), // not notable, excluded
    ];

    const result = computeRecentActivity(messages, events);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Resume downloaded");
    expect(result[1].title).toBe("New message from Ada");
  });

  it("caps the feed at the given limit", () => {
    const messages = Array.from({ length: 10 }, (_, i) => ({
      name: `Person ${i}`,
      subject: "Hi",
      createdAt: new Date(2026, 9, 10, i).toISOString(),
    }));
    expect(computeRecentActivity(messages, [], 3)).toHaveLength(3);
  });
});
