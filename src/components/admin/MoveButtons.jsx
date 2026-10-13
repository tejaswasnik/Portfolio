import { ChevronDownIcon, ChevronUpIcon } from "@/components/ui/icons.jsx";

/**
 * Up/down reorder buttons (design.md §23) — the keyboard/touch-friendly
 * alternative to a drag handle, which doesn't work on touch at all.
 * Shared by every admin sortable list (projects, skills, sections).
 * @param {{ disabled: boolean, atStart: boolean, atEnd: boolean, name: string, onMove: (direction: -1 | 1) => void, className?: string }} props
 */
export default function MoveButtons({ disabled, atStart, atEnd, name, onMove, className = "" }) {
  return (
    <div className={`flex items-center gap-1 ${className}`.trim()}>
      <button
        type="button"
        disabled={disabled || atStart}
        aria-label={`Move ${name} up`}
        onClick={() => onMove(-1)}
        className="flex size-6 items-center justify-center rounded border border-border-default bg-surface-3 text-text-muted transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronUpIcon size={12} />
      </button>
      <button
        type="button"
        disabled={disabled || atEnd}
        aria-label={`Move ${name} down`}
        onClick={() => onMove(1)}
        className="flex size-6 items-center justify-center rounded border border-border-default bg-surface-3 text-text-muted transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronDownIcon size={12} />
      </button>
    </div>
  );
}
