import {
  DashboardIcon,
  FolderIcon,
  GlobeIcon,
  GripIcon,
  ImageIcon,
  LayersIcon,
  MailIcon,
  PanelsIcon,
  SlidersIcon,
  UserIcon,
} from "@/components/ui/icons.jsx";

/**
 * Sidebar groups and labels, from Figma 53:3 (Overview/Content/Site).
 * Shared with Topbar so the breadcrumb label always matches the sidebar
 * label for the same route.
 */
export const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", Icon: DashboardIcon },
      { href: "/admin/messages", label: "Messages", Icon: MailIcon, badgeKey: "unreadMessages" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/projects", label: "Projects", Icon: FolderIcon },
      { href: "/admin/skills", label: "Skills", Icon: LayersIcon },
      { href: "/admin/profile", label: "Profile & About", Icon: UserIcon },
      { href: "/admin/banner", label: "Banner", Icon: ImageIcon },
      { href: "/admin/interest-images", label: "Interest images", Icon: GripIcon },
      { href: "/admin/media", label: "Media library", Icon: GlobeIcon },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/sections", label: "Sections", Icon: PanelsIcon },
      { href: "/admin/settings", label: "Settings", Icon: SlidersIcon },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

/** True when `pathname` is `href` or a sub-route of it (e.g. /admin/projects/new). */
export function isActiveRoute(pathname, href) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The deepest-matching nav item's label, for the topbar breadcrumb. */
export function currentPageLabel(pathname) {
  const match = ALL_NAV_ITEMS.find((item) => isActiveRoute(pathname, item.href));
  return match?.label ?? "Dashboard";
}
