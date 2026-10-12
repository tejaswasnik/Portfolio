import Link from "next/link";
import SectionDivider from "@/components/ui/SectionDivider";
import LoginForm from "@/components/admin/LoginForm";
import { ArrowLeftIcon } from "@/components/ui/icons.jsx";

export const metadata = { title: "Sign in — Admin" };

/** Admin — Login (Figma 57:2 / error state 57:70). */
export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="flex h-16 items-center justify-between border-b border-dashed border-rail px-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <span className="font-serif text-xl tracking-[0.5px] text-text-primary">TW.</span>
          <span className="rounded-sm border border-border-default bg-surface-3 px-1.5 py-0.5 font-mono text-[8px] font-bold text-accent">
            ADMIN
          </span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-[11px] text-text-muted hover:text-text-primary"
        >
          <ArrowLeftIcon size={14} />
          Back to site
        </Link>
      </div>

      <SectionDivider />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <LoginForm />
      </main>

      <div className="flex h-16 items-center justify-between border-t border-dashed border-rail px-6 font-mono text-[10px] text-text-muted sm:px-10">
        <p>© {new Date().getFullYear()} · Built with care.</p>
        <p>Private area</p>
      </div>
    </div>
  );
}
