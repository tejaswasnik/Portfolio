import { describe, expect, it, vi, beforeEach } from "vitest";

const requireAdminMock = vi.fn();
const bumpTokenVersionMock = vi.fn();

vi.mock("@/lib/auth/requireAdmin.js", () => ({ requireAdmin: requireAdminMock }));
vi.mock("@/lib/db/collections/users.js", () => ({ bumpTokenVersion: bumpTokenVersionMock }));

function postRequest({ origin = "http://localhost" } = {}) {
  const headers = {};
  if (origin) headers.origin = origin;
  return new Request("http://localhost/api/admin/logout", { method: "POST", headers });
}

describe("POST /api/admin/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bumps tokenVersion and clears the cookie for a valid session", async () => {
    requireAdminMock.mockResolvedValue({ db: {}, user: { _id: "user-1" } });

    const { POST } = await import("./route.js");
    const response = await POST(postRequest());
    const json = await response.json();

    expect(json).toEqual({ ok: true });
    expect(bumpTokenVersionMock).toHaveBeenCalledWith({}, "user-1");
    expect(response.headers.get("set-cookie")).toContain("admin_session=;");
  });

  it("still clears the cookie when there is no valid session", async () => {
    requireAdminMock.mockResolvedValue(null);

    const { POST } = await import("./route.js");
    const response = await POST(postRequest());

    expect(response.status).toBe(200);
    expect(bumpTokenVersionMock).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toContain("admin_session=;");
  });

  it("rejects a cross-origin request with 403", async () => {
    const { POST } = await import("./route.js");
    const response = await POST(postRequest({ origin: "https://evil.example" }));

    expect(response.status).toBe(403);
    expect(requireAdminMock).not.toHaveBeenCalled();
  });
});
