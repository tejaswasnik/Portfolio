import { describe, expect, it } from "vitest";
import { withImageKitTransform } from "./url.js";

describe("withImageKitTransform", () => {
  it("appends a tr= query param to an ImageKit url", () => {
    expect(withImageKitTransform("https://ik.imagekit.io/demo/photo.jpg", "w-220,q-80")).toBe(
      "https://ik.imagekit.io/demo/photo.jpg?tr=w-220,q-80",
    );
  });

  it("uses & when the url already has a query string", () => {
    expect(withImageKitTransform("https://ik.imagekit.io/demo/photo.jpg?v=2", "w-220")).toBe(
      "https://ik.imagekit.io/demo/photo.jpg?v=2&tr=w-220",
    );
  });

  it("leaves a non-ImageKit url untouched", () => {
    expect(withImageKitTransform("https://example.com/photo.jpg", "w-220")).toBe(
      "https://example.com/photo.jpg",
    );
  });

  it("doesn't double-transform a url that already has one", () => {
    const transformed = "https://ik.imagekit.io/demo/photo.jpg?tr=w-220";
    expect(withImageKitTransform(transformed, "w-400")).toBe(transformed);
  });

  it("passes through null/undefined/empty", () => {
    expect(withImageKitTransform(null, "w-220")).toBe(null);
    expect(withImageKitTransform(undefined, "w-220")).toBe(undefined);
    expect(withImageKitTransform("", "w-220")).toBe("");
  });
});
