import { describe, expect, it, vi, beforeEach } from "vitest";

const getDbMock = vi.fn();
const insertEventMock = vi.fn();
const verifySessionTokenMock = vi.fn();

vi.mock("@/lib/db/client.js", () => ({ getDb: getDbMock }));
vi.mock("@/lib/db/collections/events.js", () => ({ insertEvent: insertEventMock }));
vi.mock("@/lib/auth/jwt.js", () => ({ verifySessionToken: verifySessionTokenMock }));

const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function postRequest(body, headers = {}) {
  return new Request("http://localhost/api/track", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": CHROME_UA, ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/track", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDbMock.mockResolvedValue({});
    verifySessionTokenMock.mockResolvedValue(null);
    insertEventMock.mockResolvedValue({});
  });

  it("inserts a valid view event and always returns ok", async () => {
    const { POST } = await import("./route.js");
    const response = await POST(postRequest({ type: "view", path: "/" }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(insertEventMock).toHaveBeenCalledTimes(1);
    expect(insertEventMock.mock.calls[0][1]).toMatchObject({ type: "view", path: "/" });
  });

  it("skips the insert (but still returns ok) when the request has a valid admin session cookie", async () => {
    verifySessionTokenMock.mockResolvedValue({ sub: "user-1", ver: 0 });

    const { POST } = await import("./route.js");
    const response = await POST(
      postRequest({ type: "view", path: "/" }, { cookie: "admin_session=valid-token" }),
    );

    expect(response.status).toBe(200);
    expect(insertEventMock).not.toHaveBeenCalled();
  });

  it("skips the insert for a bot user agent", async () => {
    const { POST } = await import("./route.js");
    const response = await POST(
      postRequest({ type: "view", path: "/" }, { "user-agent": "Googlebot/2.1" }),
    );

    expect(response.status).toBe(200);
    expect(insertEventMock).not.toHaveBeenCalled();
  });

  it("skips the insert for an invalid body, without erroring", async () => {
    const { POST } = await import("./route.js");
    const response = await POST(postRequest({ type: "not-a-type" }));

    expect(response.status).toBe(200);
    expect(insertEventMock).not.toHaveBeenCalled();
  });

  it("never throws even when the DB is unreachable", async () => {
    getDbMock.mockRejectedValue(new Error("ECONNREFUSED"));

    const { POST } = await import("./route.js");
    const response = await POST(postRequest({ type: "view", path: "/" }));

    expect(response.status).toBe(200);
  });

  it("derives device/browser/os from the user agent and hashes the visitor, never storing a raw IP", async () => {
    const { POST } = await import("./route.js");
    await POST(
      postRequest(
        { type: "view", path: "/" },
        { "x-forwarded-for": "203.0.113.5", "x-vercel-ip-country": "IN" },
      ),
    );

    const [, event] = insertEventMock.mock.calls[0];
    expect(event.device).toBe("Desktop");
    expect(event.browser).toBe("Chrome");
    expect(event.os).toBe("Windows");
    expect(event.country).toBe("IN");
    expect(event.visitorHash).not.toContain("203.0.113.5");
    expect(typeof event.visitorHash).toBe("string");
  });
});
