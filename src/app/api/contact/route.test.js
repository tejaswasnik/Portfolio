import { describe, expect, it, vi, beforeEach } from "vitest";

const insertMessageMock = vi.fn();
const markMessageEmailFailedMock = vi.fn();
const getSiteSettingsMock = vi.fn();
const checkAndIncrementRateLimitMock = vi.fn();
const sendContactNotificationMock = vi.fn();
const getDbMock = vi.fn();

vi.mock("@/lib/db/client.js", () => ({ getDb: getDbMock }));
vi.mock("@/lib/db/collections/messages.js", () => ({
  insertMessage: insertMessageMock,
  markMessageEmailFailed: markMessageEmailFailedMock,
}));
vi.mock("@/lib/db/collections/site-settings.js", () => ({
  getSiteSettings: getSiteSettingsMock,
}));
vi.mock("@/lib/rate-limit/index.js", () => ({
  checkAndIncrementRateLimit: checkAndIncrementRateLimitMock,
}));
vi.mock("@/lib/mail/sendMail.js", () => ({
  sendContactNotification: sendContactNotificationMock,
}));

const validBody = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Hello",
  message: "I enjoyed your portfolio.",
  company: "",
};

function postRequest(body, headers = {}) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDbMock.mockResolvedValue({});
    insertMessageMock.mockResolvedValue({ insertedId: "msg-1" });
    getSiteSettingsMock.mockResolvedValue({ notificationEmail: "owner@example.com" });
    checkAndIncrementRateLimitMock.mockResolvedValue(true);
    sendContactNotificationMock.mockResolvedValue({ ok: true });
  });

  it("saves the message and reports success when email sends fine", async () => {
    const { POST } = await import("./route.js");
    const response = await POST(postRequest(validBody));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(insertMessageMock).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ name: "Ada Lovelace", email: "ada@example.com" }),
    );
    expect(markMessageEmailFailedMock).not.toHaveBeenCalled();
  });

  it("rejects invalid input with a 400 and field errors, without saving", async () => {
    const { POST } = await import("./route.js");
    const response = await POST(postRequest({ ...validBody, email: "not-an-email" }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.fieldErrors.email).toBeTruthy();
    expect(insertMessageMock).not.toHaveBeenCalled();
  });

  it("silently pretends success on a filled honeypot, without saving or emailing", async () => {
    const { POST } = await import("./route.js");
    const response = await POST(postRequest({ ...validBody, company: "I am a bot" }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(insertMessageMock).not.toHaveBeenCalled();
    expect(sendContactNotificationMock).not.toHaveBeenCalled();
  });

  it("returns 429 and never saves when the rate limit is exceeded", async () => {
    checkAndIncrementRateLimitMock.mockResolvedValue(false);
    const { POST } = await import("./route.js");
    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(429);
    expect(insertMessageMock).not.toHaveBeenCalled();
  });

  it("still saves and returns success when the notification email fails, flagging emailFailed", async () => {
    sendContactNotificationMock.mockResolvedValue({ ok: false });
    const { POST } = await import("./route.js");
    const response = await POST(postRequest(validBody));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(insertMessageMock).toHaveBeenCalled();
    expect(markMessageEmailFailedMock).toHaveBeenCalledWith({}, "msg-1");
  });

  it("flags emailFailed when siteSettings has no notificationEmail configured", async () => {
    getSiteSettingsMock.mockResolvedValue(null);
    const { POST } = await import("./route.js");
    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(200);
    expect(sendContactNotificationMock).not.toHaveBeenCalled();
    expect(markMessageEmailFailedMock).toHaveBeenCalledWith({}, "msg-1");
  });

  it("returns 503 when the database is unreachable", async () => {
    getDbMock.mockRejectedValue(new Error("connection refused"));
    const { POST } = await import("./route.js");
    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(503);
    expect(checkAndIncrementRateLimitMock).not.toHaveBeenCalled();
  });
});
