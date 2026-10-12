const QUERY = `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetches a GitHub user's public contribution calendar via the GraphQL
 * API. Returns `null` on any failure (missing token, bad username,
 * network error, rate limit) so the heatmap section can simply be
 * omitted — per docs/ARCHITECTURE.md "hide the section on failure".
 * Revalidates every 6 hours via Next's fetch cache.
 * @param {string} login GitHub username
 * @returns {Promise<{ weeks: Array<{ days: Array<{ date: string, count: number }> }> } | null>}
 */
export async function getContributionCalendar(login) {
  const token = process.env.GITHUB_TOKEN;
  if (!token || !login) return null;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      next: { revalidate: 6 * 60 * 60 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const calendar =
      json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar?.weeks) return null;

    return {
      weeks: calendar.weeks.map((week) => ({
        days: week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
        })),
      })),
    };
  } catch {
    return null;
  }
}

/**
 * Buckets a raw contribution count into the design system's 5-level
 * heat scale (docs/design.md §2 --heat-0..--heat-4), using the same
 * max-relative thresholds GitHub's own UI uses.
 * @param {number} count
 * @param {number} max highest single-day count across the fetched range
 */
export function heatLevel(count, max) {
  if (count <= 0 || max <= 0) return 0;
  const ratio = count / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}
