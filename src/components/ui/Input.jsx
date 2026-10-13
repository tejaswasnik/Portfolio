/**
 * Text input matching the contact form field (Figma 74:1112).
 * @param {{label?: string, className?: string} & React.InputHTMLAttributes<HTMLInputElement>} props
 */
export default function Input({ label, id, className = "", ...props }) {
  const input = (
    <input
      id={id}
      className={`w-full rounded-lg border border-border-default bg-bg px-3.5 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus-visible:border-accent ${className}`.trim()}
      {...props}
    />
  );

  if (!label) return input;

  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-wide text-text-secondary">
        {label}
      </span>
      {input}
    </label>
  );
}
