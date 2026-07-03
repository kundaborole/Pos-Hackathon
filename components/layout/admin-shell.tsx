"use client";
import * as React from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";

import { Database } from "@/types/supabase";

export function AdminShell({ children, profile }: { children: React.ReactNode; profile?: Database['public']['Tables']['profiles']['Row'] }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Close mobile menu when screen size increases
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen w-full bg-bg-base overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <AdminSidebar profile={profile} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <AdminTopbar profile={profile} onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
