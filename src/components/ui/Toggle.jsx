"use client";

/**
 * On/off switch for admin section/skill visibility toggles.
 * No Figma frame exists for this control — built from design tokens
 * (see docs/PROGRESS.md "Designed by me").
 * @param {{checked: boolean, onChange: (next: boolean) => void, label?: string, disabled?: boolean}} props
 */
export default function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-pill border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 ${
        checked
          ? "border-accent bg-accent/30"
          : "border-border-default bg-surface-3"
      }`}
    >
      <span
        className={`inline-block size-3.5 rounded-pill bg-text-primary transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-1"
        }`}
      />
    </button>
  );
}
