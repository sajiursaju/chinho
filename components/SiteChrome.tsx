"use client";

import { usePathname } from "next/navigation";

export default function SiteChrome({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const isPanel = path.startsWith("/admin") || path === "/admin-login";

  return (
    <>
      {!isPanel && header}
      {children}
      {!isPanel && footer}
    </>
  );
}
