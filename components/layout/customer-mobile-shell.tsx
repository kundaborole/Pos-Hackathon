"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import { MobileBottomNavigation } from "./mobile-bottom-navigation";

export function CustomerMobileShell({ children, hideNav: propHideNav }: { children: React.ReactNode, hideNav?: boolean }) {
  const pathname = usePathname();
  
  // Extract tableToken from the URL if possible, otherwise use a fallback
  const segments = pathname.split('/');
  const orderIndex = segments.indexOf('order');
  const tableToken = orderIndex !== -1 && segments.length > orderIndex + 1 ? segments[orderIndex + 1] : 'demo-table';

  // Certain pages might not need bottom navigation (like success screen)
  const hideNav = propHideNav !== undefined ? propHideNav : (pathname.includes('/success') || pathname.includes('/payment') || pathname === `/order/${tableToken}`);

  return (
    <div className="flex flex-col min-h-screen bg-bg-base">
      <div className="flex-1 w-full max-w-[430px] mx-auto bg-bg-surface shadow-sm overflow-hidden relative">
        <main className={hideNav ? "h-full" : "pb-16"}>
          {children}
        </main>
        {!hideNav && <MobileBottomNavigation tableToken={tableToken} />}
      </div>
    </div>
  );
}
