import { describe, expect, it, vi, beforeEach } from "vitest";

const getDbMock = vi.fn();
const findUserByEmailMock = vi.fn();
const recordLoginFailureMock = vi.fn();
const resetLoginFailuresMock = vi.fn();
const verifyPasswordMock = vi.fn();
const signSessionTokenMock = vi.fn();

vi.mock("@/lib/db/client.js", () => ({ getDb: getDbMock }));
vi.mock("@/lib/db/collections/users.js", () => ({
  findUserByEmail: findUserByEmailMock,
  recordLoginFailure: recordLoginFailureMock,
  resetLoginFailures: resetLoginFailuresMock,
}));
vi.mock("@/lib/auth/password.js", () => ({ verifyPassword: verifyPasswordMock }));
vi.mock("@/lib/auth/jwt.js", () => ({
  signSessionToken: signSessionTokenMock,
  SESSION_MAX_AGE_SECONDS: 1800,
}));

function postRequest(body, { origin = "http://localhost" } = {}) {
  const headers = { "content-type": "application/json" };
  if (origin) headers.origin = origin;
  return new Request("http://localhost/api/admin/login", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

const credentials = { email: "admin@example.com", password: "correct-horse-battery-staple" };

describe("POST /api/admin/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDbMock.mockResolvedValue({});
    signSessionTokenMock.mockResolvedValue("signed-token");
  });

  it("signs in with correct credentials and sets the session cookie", async () => {
    findUserByEmailMock.mockResolvedValue({
      _id: { toString: () => "user-1" },
      email: credentials.email,
      passwordHash: "hash",
      tokenVersion: 0,
      failedAttempts: 2,
      lockedUntil: null,
    });
    verifyPasswordMock.mockResolvedValue(true);

    const { POST } = await import("./route.js");
    const response = await POST(postRequest(credentials));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(resetLoginFailuresMock).toHaveBeenCalledWith({}, credentials.email);
    expect(response.headers.get("set-cookie")).toContain("admin_session=signed-token");
  });

  it("rejects a cross-origin request with 403 before touching the database", async () => {
    const { POST } = await import("./route.js");
    const response = await POST(postRequest(credentials, { origin: "https://evil.example" }));

    expect(response.status).toBe(403);
    expect(getDbMock).not.toHaveBeenCalled();
  });

  it("returns a generic 401 for a nonexistent email", async () => {
    findUserByEmailMock.mockResolvedValue(null);

    const { POST } = await import("./route.js");
    const response = await POST(postRequest(credentials));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe("Invalid email or password.");
  });

  it("increments failedAttempts and reports attempts left on a wrong password", async () => {
    findUserByEmailMock.mockResolvedValue({
      _id: { toString: () => "user-1" },
      email: credentials.email,
      passwordHash: "hash",
      tokenVersion: 0,
      failedAttempts: 1,
      lockedUntil: null,
    });
    verifyPasswordMock.mockResolvedValue(false);

    const { POST } = await import("./route.js");
    const response = await POST(postRequest(credentials));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toMatch(/3 attempts left/);
    expect(recordLoginFailureMock).toHaveBeenCalledWith(
      {},
      credentials.email,
      expect.objectContaining({ failedAttempts: 2 }),
    );
    expect(signSessionTokenMock).not.toHaveBeenCalled();
  });

  it("locks the account once the failure threshold is reached", async () => {
    findUserByEmailMock.mockResolvedValue({
      _id: { toString: () => "user-1" },
      email: credentials.email,
      passwordHash: "hash",
      tokenVersion: 0,
      failedAttempts: 4,
      lockedUntil: null,
    });
    verifyPasswordMock.mockResolvedValue(false);

    const { POST } = await import("./route.js");
    const response = await POST(postRequest(credentials));
    const json = await response.json();

    expect(response.status).toBe(423);
    expect(json.error).toMatch(/15 minutes/);
  });

  it("returns 423 immediately for an already-locked account, without checking the password", async () => {
    findUserByEmailMock.mockResolvedValue({
      _id: { toString: () => "user-1" },
      email: credentials.email,
      passwordHash: "hash",
      tokenVersion: 0,
      failedAttempts: 5,
      lockedUntil: new Date(Date.now() + 60_000),
    });

    const { POST } = await import("./route.js");
    const response = await POST(postRequest(credentials));

    expect(response.status).toBe(423);
    expect(verifyPasswordMock).not.toHaveBeenCalled();
  });

  it("returns 503 when the database is unreachable, without leaking internal error details", async () => {
    getDbMock.mockRejectedValue(new Error("querySrv ECONNREFUSED _mongodb._tcp.cluster0.example.net"));

    const { POST } = await import("./route.js");
    const response = await POST(postRequest(credentials));
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json).not.toHaveProperty("details");
    expect(JSON.stringify(json)).not.toMatch(/ECONNREFUSED|mongodb/i);
  });
});
