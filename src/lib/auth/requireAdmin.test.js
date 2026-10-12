import { describe, expect, it, vi, beforeEach } from "vitest";

const cookiesMock = vi.fn();
const redirectMock = vi.fn((path) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
const verifySessionTokenMock = vi.fn();
const getDbMock = vi.fn();
const findUserByIdMock = vi.fn();

vi.mock("next/headers", () => ({ cookies: cookiesMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("./jwt.js", () => ({ verifySessionToken: verifySessionTokenMock }));
vi.mock("../db/client.js", () => ({ getDb: getDbMock }));
vi.mock("../db/collections/users.js", () => ({ findUserById: findUserByIdMock }));

function cookieStoreWith(token) {
  return { get: (name) => (name === "admin_session" && token ? { value: token } : undefined) };
}

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getDbMock.mockResolvedValue({});
  });

  it("returns the session when the token is valid and tokenVersion matches", async () => {
    cookiesMock.mockResolvedValue(cookieStoreWith("good-token"));
    verifySessionTokenMock.mockResolvedValue({ sub: "user-1", ver: 2 });
    findUserByIdMock.mockResolvedValue({ _id: "user-1", tokenVersion: 2 });

    const { requireAdmin } = await import("./requireAdmin.js");
    const session = await requireAdmin();

    expect(session.user).toEqual({ _id: "user-1", tokenVersion: 2 });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects to /admin/login with no cookie", async () => {
    cookiesMock.mockResolvedValue(cookieStoreWith(undefined));

    const { requireAdmin } = await import("./requireAdmin.js");
    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT:/admin/login");
  });

  it("redirects when the token fails signature/expiry verification", async () => {
    cookiesMock.mockResolvedValue(cookieStoreWith("bad-token"));
    verifySessionTokenMock.mockResolvedValue(null);

    const { requireAdmin } = await import("./requireAdmin.js");
    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT:/admin/login");
  });

  it("redirects when tokenVersion has been bumped since the token was issued (logout-elsewhere/password change)", async () => {
    cookiesMock.mockResolvedValue(cookieStoreWith("stale-token"));
    verifySessionTokenMock.mockResolvedValue({ sub: "user-1", ver: 1 });
    findUserByIdMock.mockResolvedValue({ _id: "user-1", tokenVersion: 2 });

    const { requireAdmin } = await import("./requireAdmin.js");
    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT:/admin/login");
  });

  it("returns null instead of redirecting when redirectOnFail is false", async () => {
    cookiesMock.mockResolvedValue(cookieStoreWith(undefined));

    const { requireAdmin } = await import("./requireAdmin.js");
    const session = await requireAdmin({ redirectOnFail: false });

    expect(session).toBeNull();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("treats a database failure as unauthenticated rather than throwing", async () => {
    cookiesMock.mockResolvedValue(cookieStoreWith("good-token"));
    verifySessionTokenMock.mockResolvedValue({ sub: "user-1", ver: 2 });
    getDbMock.mockRejectedValue(new Error("connection refused"));

    const { requireAdmin } = await import("./requireAdmin.js");
    const session = await requireAdmin({ redirectOnFail: false });

    expect(session).toBeNull();
  });
});
