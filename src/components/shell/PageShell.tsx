"use client";

import { usePathname } from "next/navigation";

/**
 * Route transition wrapper: a short, springy entrance on every navigation.
 * Respects reduced motion via the global CSS rules.
 */
export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
