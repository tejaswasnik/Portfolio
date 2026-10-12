/**
 * Multi-line input matching the contact form message field (Figma 74:1124).
 * @param {{label?: string, className?: string} & React.TextareaHTMLAttributes<HTMLTextAreaElement>} props
 */
export default function Textarea({ label, id, className = "", ...props }) {
  const textarea = (
    <textarea
      id={id}
      rows={5}
      className={`w-full rounded-lg border border-border-default bg-bg px-3.5 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus-visible:border-accent ${className}`.trim()}
      {...props}
    />
  );

  if (!label) return textarea;

  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-wide text-text-secondary">
        {label}
      </span>
      {textarea}
    </label>
  );
}
