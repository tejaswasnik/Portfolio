import { describe, expect, it, vi, beforeEach } from "vitest";

const requireAdminMock = vi.fn();
const generateUploadAuthMock = vi.fn();

vi.mock("@/lib/auth/requireAdmin.js", () => ({ requireAdmin: requireAdminMock }));
vi.mock("@/lib/imagekit/client.js", () => ({ generateUploadAuth: generateUploadAuthMock }));

describe("GET /api/imagekit-auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when there is no valid admin session", async () => {
    requireAdminMock.mockResolvedValue(null);

    const { GET } = await import("./route.js");
    const response = await GET();

    expect(response.status).toBe(401);
    expect(generateUploadAuthMock).not.toHaveBeenCalled();
  });

  it("returns 503 when ImageKit isn't configured", async () => {
    requireAdminMock.mockResolvedValue({ db: {}, user: {} });
    generateUploadAuthMock.mockReturnValue(null);

    const { GET } = await import("./route.js");
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.error).toMatch(/not.*configured|aren't configured/i);
  });

  it("returns the signed auth params for a valid admin session", async () => {
    requireAdminMock.mockResolvedValue({ db: {}, user: {} });
    generateUploadAuthMock.mockReturnValue({
      token: "tok",
      expire: 123,
      signature: "sig",
      publicKey: "pub_key",
      urlEndpoint: "https://ik.imagekit.io/demo",
    });

    const { GET } = await import("./route.js");
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      token: "tok",
      expire: 123,
      signature: "sig",
      publicKey: "pub_key",
      urlEndpoint: "https://ik.imagekit.io/demo",
    });
  });
});
