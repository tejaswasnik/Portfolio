// Registered as a global Vitest setupFile — extends `expect` with
// `@testing-library/jest-dom` matchers (`toBeInTheDocument`, etc.) for
// every test, jsdom or node. The matchers themselves only do anything
// meaningful against a DOM, which only the jsdom-environment component
// tests create, so this is a no-op import for the 56 existing
// node-environment tests.
import "@testing-library/jest-dom/vitest";

import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmounts whatever a jsdom test's render() mounted, so the next test in
// the same file starts from an empty document instead of accumulating
// every previous test's DOM (no-op — document.body is empty either
// way — for the node-environment tests, which never call render()).
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement IntersectionObserver, which motion/react's
// `whileInView` (Reveal.jsx, CountUp.jsx) needs just to construct — a
// minimal stub that never actually fires is enough for component tests
// that don't assert on real in-view behavior. Guarded by `typeof window`
// so this is a no-op for the node-environment tests.
if (typeof window !== "undefined" && !window.IntersectionObserver) {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.IntersectionObserver = MockIntersectionObserver;
  globalThis.IntersectionObserver = MockIntersectionObserver;
}
