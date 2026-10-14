const base =
  "press inline-flex items-center justify-center gap-2 cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  // CTA pill — "Let's Talk" (Figma 5:6268)
  primary:
    "rounded-pill bg-cta-bg border border-cta-bg text-cta-text px-8 py-3.5 text-sm font-medium font-sans tracking-[0.005em] hover:bg-text-primary",
  // Dashed outline — "View details" (Figma 10:1312)
  dashed:
    "rounded-lg border border-dashed border-border-default px-3.5 py-2.5 text-text-primary text-[11px] font-bold font-mono uppercase tracking-normal hover:border-accent/50",
  // Square icon action — "Github action" (Figma 10:1227)
  icon: "rounded-md border border-border-default bg-surface-3 text-text-primary size-7 hover:bg-border-icon hover:border-border-hover",
};

/**
 * @param {{variant?: 'primary'|'dashed'|'icon', className?: string} & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export default function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
