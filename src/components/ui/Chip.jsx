const variants = {
  // Stack pill inside a project card (docs/design.md §6.7)
  tech: "rounded-pill bg-surface-3 border border-border-default px-2 gap-1.5 h-[25px] text-[10px] font-mono text-text-primary",
  // Dashed skill chip — Tech Stack section (Figma 10:910)
  skill: "rounded-md bg-surface-chip border border-dashed border-chip-dashed pl-2 pr-3 py-1 gap-1.5 h-7 text-sm font-sans text-text-chip",
};

/**
 * @param {{variant?: 'tech'|'skill', icon?: React.ReactNode, children: React.ReactNode, className?: string}} props
 */
export default function Chip({
  variant = "skill",
  icon,
  children,
  className = "",
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap ${variants[variant]} ${className}`.trim()}
    >
      {icon}
      {children}
    </span>
  );
}
