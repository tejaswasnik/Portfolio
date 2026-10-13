// Registered as a global Vitest setupFile — extends `expect` with
// `@testing-library/jest-dom` matchers (`toBeInTheDocument`, etc.) for
// every test, jsdom or node. The matchers themselves only do anything
// meaningful against a DOM, which only the jsdom-environment component
// tests create, so this is a no-op import for the 56 existing
// node-environment tests.
import "@testing-library/jest-dom/vitest";
