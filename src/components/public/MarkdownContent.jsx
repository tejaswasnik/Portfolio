import { renderMarkdown } from "@/lib/markdown";

/**
 * Renders a project's `longDescription` markdown (sanitised by
 * markdown-it's `html: false` escaping — see src/lib/markdown.js).
 * Heading/paragraph/list/quote styling lives in the `.markdown-body`
 * rule in src/styles/globals.css, matching the About section's real
 * typography (Figma 72:505 — heading 24px serif, subheading 20px
 * serif, paragraph 14.5px Inter, dash-marker list, accent-bar quote).
 * @param {{ content: string }} props
 */
export default function MarkdownContent({ content }) {
  const html = renderMarkdown(content);
  if (!html) return null;

  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
