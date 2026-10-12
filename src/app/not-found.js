import NotFoundView from "@/components/public/NotFoundView";

export const metadata = {
  title: "Page not found — Tejas Wasnik",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return <NotFoundView />;
}
