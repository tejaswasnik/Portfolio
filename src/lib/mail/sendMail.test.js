import { describe, expect, it, vi, beforeEach } from "vitest";

const sendMailMock = vi.fn();
const createTransportMock = vi.fn(() => ({ sendMail: sendMailMock }));

vi.mock("nodemailer", () => ({
  default: { createTransport: createTransportMock },
}));

const coreEnv = {
  MONGODB_URI: "mongodb://localhost:27017/portfolio",
  JWT_SECRET: "secret",
  ADMIN_EMAIL: "admin@example.com",
};

describe("sendMail / sendContactNotification", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    sendMailMock.mockReset();
    createTransportMock.mockClear();
  });

  it("returns ok:false without sending when Gmail OAuth credentials are missing", async () => {
    for (const [key, value] of Object.entries(coreEnv)) vi.stubEnv(key, value);
    const { sendMail } = await import("./sendMail.js");

    const result = await sendMail({ to: "owner@example.com", subject: "Hi", text: "Body" });

    expect(result).toEqual({ ok: false });
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("sends via the OAuth2 transport and returns ok:true when credentials are present", async () => {
    for (const [key, value] of Object.entries(coreEnv)) vi.stubEnv(key, value);
    vi.stubEnv("GOOGLE_CLIENT_ID", "client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "client-secret");
    vi.stubEnv("GOOGLE_REFRESH_TOKEN", "refresh-token");
    vi.stubEnv("GMAIL_USER", "owner@gmail.com");
    sendMailMock.mockResolvedValue({ messageId: "abc" });

    const { sendMail } = await import("./sendMail.js");
    const result = await sendMail({ to: "owner@example.com", subject: "Hi", text: "Body" });

    expect(result).toEqual({ ok: true });
    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({ auth: expect.objectContaining({ type: "OAuth2" }) }),
    );
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "owner@example.com", subject: "Hi" }),
    );
  });

  it("returns ok:false (not a throw) when the transport rejects the send", async () => {
    for (const [key, value] of Object.entries(coreEnv)) vi.stubEnv(key, value);
    vi.stubEnv("GOOGLE_CLIENT_ID", "client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "client-secret");
    vi.stubEnv("GOOGLE_REFRESH_TOKEN", "refresh-token");
    vi.stubEnv("GMAIL_USER", "owner@gmail.com");
    sendMailMock.mockRejectedValue(new Error("network error"));

    const { sendMail } = await import("./sendMail.js");
    await expect(sendMail({ to: "owner@example.com", subject: "Hi", text: "Body" })).resolves.toEqual({
      ok: false,
    });
  });

  it("sendContactNotification formats the message body and a prefixed subject", async () => {
    for (const [key, value] of Object.entries(coreEnv)) vi.stubEnv(key, value);
    vi.stubEnv("GOOGLE_CLIENT_ID", "client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "client-secret");
    vi.stubEnv("GOOGLE_REFRESH_TOKEN", "refresh-token");
    vi.stubEnv("GMAIL_USER", "owner@gmail.com");
    sendMailMock.mockResolvedValue({});

    const { sendContactNotification } = await import("./sendMail.js");
    await sendContactNotification({
      to: "owner@example.com",
      name: "Ada",
      email: "ada@example.com",
      subject: "Hello",
      message: "Hi there",
    });

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Portfolio contact: Hello",
        text: expect.stringContaining("Ada <ada@example.com>"),
      }),
    );
  });
});
