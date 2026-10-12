/**
 * 12px hatched strip at the top of each section (docs/design.md §5).
 * Figma's "Fine hatching" export is an empty <g> (no fill was exported),
 * so this reproduces it as a CSS repeating-linear-gradient per the
 * design doc's own fallback recipe — see docs/DECISIONS.md.
 */
export default function SectionDivider({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`h-3 w-full border-t border-border-subtle ${className}`.trim()}
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, var(--border-subtle) 0 1px, transparent 1px 4px)",
      }}
    />
  );
}
