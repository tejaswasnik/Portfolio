import { FileIcon } from "@/components/ui/icons.jsx";
import MediaCardActions from "@/components/admin/MediaCardActions";

/** @param {number} bytes */
function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * One file card (Figma 71:646's "File — ..." components): real thumbnail
 * for images, a generic file icon for everything else, the first live
 * usage as the status tag (or "UNUSED" in the accent colour), and the
 * copy/delete controls from `MediaCardActions`.
 * @param {{
 *   file: { id: string, url: string, name: string, type: string, size: number, createdAt: string, usage: Array<{ label: string }> },
 * }} props
 */
export default function MediaCard({ file }) {
  const isImage = file.type?.startsWith("image/");
  const date = file.createdAt
    ? new Date(file.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })
    : "";
  const inUse = file.usage.length > 0;
  const statusLabel = inUse
    ? file.usage[0].label + (file.usage.length > 1 ? ` +${file.usage.length - 1}` : "")
    : "Unused";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-1 p-3">
      <div className="flex h-[110px] w-full items-center justify-center overflow-hidden rounded-lg border border-border-subtle bg-surface-2">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
          <img src={file.url} alt="" className="size-full object-cover" />
        ) : (
          <FileIcon size={24} className="text-text-muted" />
        )}
      </div>

      <div className="flex w-full flex-col gap-0.5">
        <p className="truncate text-[13px] font-medium text-text-primary">{file.name}</p>
        <p className="font-mono text-[10px] text-text-muted">
          {formatSize(file.size)} · {date}
        </p>
      </div>

      <div className="flex w-full items-center justify-between">
        <span
          className={`rounded-sm border px-2 py-1 font-mono text-[8px] font-bold uppercase ${
            inUse
              ? "border-border-default bg-surface-3 text-text-primary"
              : "border-border-default bg-surface-3 text-accent"
          }`}
        >
          {statusLabel}
        </span>
        <MediaCardActions id={file.id} url={file.url} usage={file.usage} />
      </div>
    </div>
  );
}
