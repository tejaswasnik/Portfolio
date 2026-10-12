import { describe, expect, it, vi, beforeEach } from "vitest";

const getAuthenticationParametersMock = vi.fn(() => ({
  token: "tok",
  expire: 123,
  signature: "sig",
}));
const deleteFileMock = vi.fn();
const ImageKitMock = vi.fn(function ImageKit() {
  this.getAuthenticationParameters = getAuthenticationParametersMock;
  this.deleteFile = deleteFileMock;
});

vi.mock("imagekit", () => ({ default: ImageKitMock }));

const coreEnv = {
  MONGODB_URI: "mongodb://localhost:27017/portfolio",
  JWT_SECRET: "secret",
  ADMIN_EMAIL: "admin@example.com",
};

describe("getImageKitClient / generateUploadAuth / deleteImageKitFile", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    ImageKitMock.mockClear();
    getAuthenticationParametersMock.mockClear();
    deleteFileMock.mockReset();
  });

  it("generateUploadAuth returns null when ImageKit credentials are missing", async () => {
    for (const [key, value] of Object.entries(coreEnv)) vi.stubEnv(key, value);
    const { generateUploadAuth } = await import("./client.js");

    expect(generateUploadAuth()).toBeNull();
    expect(ImageKitMock).not.toHaveBeenCalled();
  });

  it("generateUploadAuth signs and returns token/expire/signature/publicKey/urlEndpoint when configured", async () => {
    for (const [key, value] of Object.entries(coreEnv)) vi.stubEnv(key, value);
    vi.stubEnv("IMAGEKIT_PUBLIC_KEY", "pub_key");
    vi.stubEnv("IMAGEKIT_PRIVATE_KEY", "priv_key");
    vi.stubEnv("IMAGEKIT_URL_ENDPOINT", "https://ik.imagekit.io/demo");

    const { generateUploadAuth } = await import("./client.js");
    const auth = generateUploadAuth();

    expect(auth).toEqual({
      token: "tok",
      expire: 123,
      signature: "sig",
      publicKey: "pub_key",
      urlEndpoint: "https://ik.imagekit.io/demo",
    });
  });

  it("builds the ImageKit client only once (cached across calls)", async () => {
    for (const [key, value] of Object.entries(coreEnv)) vi.stubEnv(key, value);
    vi.stubEnv("IMAGEKIT_PUBLIC_KEY", "pub_key");
    vi.stubEnv("IMAGEKIT_PRIVATE_KEY", "priv_key");
    vi.stubEnv("IMAGEKIT_URL_ENDPOINT", "https://ik.imagekit.io/demo");

    const { generateUploadAuth } = await import("./client.js");
    generateUploadAuth();
    generateUploadAuth();

    expect(ImageKitMock).toHaveBeenCalledTimes(1);
  });

  it("deleteImageKitFile resolves ok:false without calling the API when fileId is empty", async () => {
    for (const [key, value] of Object.entries(coreEnv)) vi.stubEnv(key, value);
    vi.stubEnv("IMAGEKIT_PUBLIC_KEY", "pub_key");
    vi.stubEnv("IMAGEKIT_PRIVATE_KEY", "priv_key");
    vi.stubEnv("IMAGEKIT_URL_ENDPOINT", "https://ik.imagekit.io/demo");

    const { deleteImageKitFile } = await import("./client.js");
    const result = await deleteImageKitFile("");

    expect(result).toEqual({ ok: false });
    expect(deleteFileMock).not.toHaveBeenCalled();
  });

  it("deleteImageKitFile resolves ok:false (not a throw) when the API call fails", async () => {
    for (const [key, value] of Object.entries(coreEnv)) vi.stubEnv(key, value);
    vi.stubEnv("IMAGEKIT_PUBLIC_KEY", "pub_key");
    vi.stubEnv("IMAGEKIT_PRIVATE_KEY", "priv_key");
    vi.stubEnv("IMAGEKIT_URL_ENDPOINT", "https://ik.imagekit.io/demo");
    deleteFileMock.mockRejectedValue(new Error("not found"));

    const { deleteImageKitFile } = await import("./client.js");
    await expect(deleteImageKitFile("file_123")).resolves.toEqual({ ok: false });
  });

  it("deleteImageKitFile resolves ok:true when the API call succeeds", async () => {
    for (const [key, value] of Object.entries(coreEnv)) vi.stubEnv(key, value);
    vi.stubEnv("IMAGEKIT_PUBLIC_KEY", "pub_key");
    vi.stubEnv("IMAGEKIT_PRIVATE_KEY", "priv_key");
    vi.stubEnv("IMAGEKIT_URL_ENDPOINT", "https://ik.imagekit.io/demo");
    deleteFileMock.mockResolvedValue({});

    const { deleteImageKitFile } = await import("./client.js");
    await expect(deleteImageKitFile("file_123")).resolves.toEqual({ ok: true });
    expect(deleteFileMock).toHaveBeenCalledWith("file_123");
  });
});
