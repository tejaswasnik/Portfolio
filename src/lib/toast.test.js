import { describe, expect, it } from "vitest";
import { DEFAULT_TOAST_DURATION, dismissToast, pushToast, toastRole } from "./toast.js";

describe("pushToast", () => {
  it("appends a toast to the stack", () => {
    const result = pushToast([{ id: 1 }], { id: 2 });
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("caps the stack at 3, dropping the oldest first (design.md §21: 'max 3 visible')", () => {
    const result = pushToast([{ id: 1 }, { id: 2 }, { id: 3 }], { id: 4 });
    expect(result.map((t) => t.id)).toEqual([2, 3, 4]);
  });

  it("keeps newest at the end of the stack", () => {
    const result = pushToast([], { id: 1 });
    expect(result).toEqual([{ id: 1 }]);
  });
});

describe("dismissToast", () => {
  it("removes exactly the toast with the matching id", () => {
    const result = dismissToast([{ id: 1 }, { id: 2 }, { id: 3 }], 2);
    expect(result.map((t) => t.id)).toEqual([1, 3]);
  });

  it("is a no-op when the id isn't present", () => {
    const toasts = [{ id: 1 }];
    expect(dismissToast(toasts, 99)).toEqual(toasts);
  });
});

describe("toastRole", () => {
  it("is 'alert' for error toasts", () => {
    expect(toastRole("error")).toBe("alert");
  });

  it("is undefined for success/info (the shared aria-live container covers them)", () => {
    expect(toastRole("success")).toBeUndefined();
    expect(toastRole("info")).toBeUndefined();
  });
});

describe("DEFAULT_TOAST_DURATION", () => {
  it("gives errors a longer duration than success/info (design.md §21: '8s' vs '4s')", () => {
    expect(DEFAULT_TOAST_DURATION.error).toBeGreaterThan(DEFAULT_TOAST_DURATION.success);
    expect(DEFAULT_TOAST_DURATION.error).toBeGreaterThan(DEFAULT_TOAST_DURATION.info);
  });
});
