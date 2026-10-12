import AdminSearchInput from "@/components/admin/AdminSearchInput";

/** Thin wrapper around the shared `AdminSearchInput` (Figma 65:515). */
export default function ProjectSearchInput() {
  return (
    <AdminSearchInput
      basePath="/admin/projects"
      placeholder="Search projects…"
      label="Search projects"
      width="w-80"
    />
  );
}
