/**
 * `/admin` dashboard. This step only builds the shell (sidebar/topbar);
 * the KPI/chart widgets from Figma 53:2's "Content" area are step 11's
 * job (first-party analytics).
 */
export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-serif text-[32px] text-text-primary">Dashboard</h1>
      <p className="text-sm text-text-secondary">
        Analytics widgets land in a later step. You&apos;re signed in and the admin shell is
        working.
      </p>
    </div>
  );
}
