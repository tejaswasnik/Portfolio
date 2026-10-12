"use client";

import { createContext, useCallback, useContext, useState } from "react";

const AdminDrawerContext = createContext({
  drawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
});

/** @returns {{ drawerOpen: boolean, openDrawer: () => void, closeDrawer: () => void, toggleDrawer: () => void }} */
export function useAdminDrawer() {
  return useContext(AdminDrawerContext);
}

/**
 * Shares the off-canvas sidebar drawer's open/closed state between
 * `Topbar` (the hamburger that opens it) and `Sidebar` (the drawer
 * itself) without lifting state into the dashboard layout, which is a
 * server component — same pattern as `ContactModalProvider` (fixes
 * round 2, Fix 4: design.md §23's "off-canvas drawer opened from a
 * hamburger in the topbar").
 */
export default function AdminShellProvider({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((open) => !open), []);

  return (
    <AdminDrawerContext.Provider value={{ drawerOpen, openDrawer, closeDrawer, toggleDrawer }}>
      {children}
    </AdminDrawerContext.Provider>
  );
}
