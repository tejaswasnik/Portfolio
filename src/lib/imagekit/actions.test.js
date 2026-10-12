import { describe, expect, it, vi, beforeEach } from "vitest";

const requireAdminMock = vi.fn();
const deleteImageKitFileMock = vi.fn();
const deleteMediaByFileIdMock = vi.fn();

vi.mock("@/lib/auth/requireAdmin.js", () => ({ requireAdmin: requireAdminMock }));
vi.mock("./client.js", () => ({ deleteImageKitFile: deleteImageKitFileMock }));
vi.mock("@/lib/db/collections/media.js", () => ({ deleteMediaByFileId: deleteMediaByFileIdMock }));

describe("deleteImageKitFileAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    deleteMediaByFileIdMock.mockResolvedValue({ deletedCount: 1 });
  });

  it("returns ok:false without deleting when not authenticated", async () => {
    requireAdminMock.mockResolvedValue(null);

    const { deleteImageKitFileAction } = await import("./actions.js");
    const result = await deleteImageKitFileAction({ fileId: "file_123" });

    expect(result.ok).toBe(false);
    expect(deleteImageKitFileMock).not.toHaveBeenCalled();
  });

  it("returns ok:false on an invalid (empty) fileId", async () => {
    requireAdminMock.mockResolvedValue({ db: {}, user: {} });

    const { deleteImageKitFileAction } = await import("./actions.js");
    const result = await deleteImageKitFileAction({ fileId: "" });

    expect(result.ok).toBe(false);
    expect(deleteImageKitFileMock).not.toHaveBeenCalled();
  });

  it("delegates to deleteImageKitFile for a valid authenticated request", async () => {
    const db = {};
    requireAdminMock.mockResolvedValue({ db, user: {} });
    deleteImageKitFileMock.mockResolvedValue({ ok: true });

    const { deleteImageKitFileAction } = await import("./actions.js");
    const result = await deleteImageKitFileAction({ fileId: "file_123" });

    expect(result).toEqual({ ok: true });
    expect(deleteImageKitFileMock).toHaveBeenCalledWith("file_123");
  });

  it("also removes the file's media library catalog entry", async () => {
    const db = {};
    requireAdminMock.mockResolvedValue({ db, user: {} });
    deleteImageKitFileMock.mockResolvedValue({ ok: true });

    const { deleteImageKitFileAction } = await import("./actions.js");
    await deleteImageKitFileAction({ fileId: "file_123" });

    expect(deleteMediaByFileIdMock).toHaveBeenCalledWith(db, "file_123");
  });

  it("still cleans up the catalog entry even if the ImageKit delete itself fails", async () => {
    requireAdminMock.mockResolvedValue({ db: {}, user: {} });
    deleteImageKitFileMock.mockResolvedValue({ ok: false });

    const { deleteImageKitFileAction } = await import("./actions.js");
    const result = await deleteImageKitFileAction({ fileId: "file_123" });

    expect(result).toEqual({ ok: false });
    expect(deleteMediaByFileIdMock).toHaveBeenCalledWith({}, "file_123");
  });
});
