import { requireAdmin } from "@/lib/auth/requireAdmin.js";
import { countUnreadMessages } from "@/lib/db/collections/messages.js";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import AdminShellProvider from "@/components/admin/AdminShellProvider";

export const metadata = { title: "Admin — Dashboard" };

/**
 * The authenticated admin shell (Figma 53:2's sidebar + topbar chrome).
 * `requireAdmin()` redirects to /admin/login on failure, which
 * transitively protects every route nested under this group — each
 * route's own server actions/route handlers still call `requireAdmin()`
 * independently too (defense in depth, CLAUDE.md).
 */
export default async function AdminShellLayout({ children }) {
  const session = await requireAdmin();
  const unreadMessages = await countUnreadMessages(session.db).catch(() => 0);

  return (
    <AdminShellProvider>
      <div className="flex min-h-screen bg-bg">
        <Sidebar unreadMessages={unreadMessages} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="p-4 sm:p-8">{children}</main>
        </div>
      </div>
    </AdminShellProvider>
  );
}
