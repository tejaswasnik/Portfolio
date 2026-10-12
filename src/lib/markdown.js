import MarkdownIt from "markdown-it";

/**
 * `html: false` makes markdown-it escape any raw HTML in the source as
 * literal text instead of passing it through — the "sanitised markdown
 * rendering" the PRD asks for, with no separate sanitizer dependency.
 * `linkify`/`breaks` match plain-prose project descriptions.
 */
const markdownIt = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

/**
 * Renders a trusted-author (admin-entered) markdown string to a safe
 * HTML string for `dangerouslySetInnerHTML`.
 * @param {string} source
 * @returns {string}
 */
export function renderMarkdown(source) {
  if (!source) return "";
  return markdownIt.render(source);
}
