/**
 * Forward/back direction detection via a monotonically-increasing index
 * stamped on each history entry (task spec: "a history-index store in
 * sessionStorage and popstate"). `computeDirection` is pure; the
 * sessionStorage read/write around it is a thin, best-effort wrapper
 * since sessionStorage can throw (private browsing, quota).
 */

const STORAGE_KEY = "transitionHistoryIndex";

/**
 * @param {number | null | undefined} previousIndex the last index this tab recorded
 * @param {number | null | undefined} nextIndex the index of the entry being navigated to
 * @returns {"forward" | "back"}
 */
export function computeDirection(previousIndex, nextIndex) {
  if (previousIndex == null || nextIndex == null) return "forward";
  return nextIndex < previousIndex ? "back" : "forward";
}

export function readStoredIndex() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const n = raw === null ? 0 : parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function writeStoredIndex(index) {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(index));
  } catch {
    // Best effort — direction detection just degrades to "forward" always.
  }
}
