/**
 * Common bot/crawler/monitoring-tool user-agent substrings (case-
 * insensitive). Not exhaustive — good enough to keep obvious crawlers
 * out of the dashboard without a dependency, per PRD §3.2 "bots filtered".
 */
const BOT_PATTERNS =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot|discordbot|slackbot|curl|wget|python-requests|headlesschrome|lighthouse|pingdom|uptimerobot|ahrefsbot|semrushbot|mj12bot|dotbot/i;

/**
 * @param {string | null | undefined} userAgent
 * @returns {boolean}
 */
export function isBot(userAgent) {
  if (!userAgent) return true; // no UA at all is itself a strong bot signal
  return BOT_PATTERNS.test(userAgent);
}
