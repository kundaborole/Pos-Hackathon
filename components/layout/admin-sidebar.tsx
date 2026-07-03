"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ClipboardList, 
  Store, 
  MonitorSmartphone, 
  ChefHat, 
  CreditCard, 
  Users, 
  BarChart3, 
  Settings 
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Orders", href: "/orders", icon: ClipboardList },
  { name: "Floors & Tables", href: "/floors", icon: Store },
  { name: "POS Terminals", href: "/terminals", icon: MonitorSmartphone },
  { name: "Kitchen Config", href: "/kitchen-config", icon: ChefHat },
  { name: "Payment Methods", href: "/payment-methods", icon: CreditCard },
  { name: "Staff & Roles", href: "/staff", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex flex-col w-64 bg-bg-surface border-r border-border-warm h-full", className)}>
      <div className="h-16 flex items-center px-6 border-b border-border-warm">
        <h1 className="text-xl font-bold text-primary-forest tracking-tight">Cafe Hub</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                isActive
                  ? "bg-primary-green/10 text-primary-green"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary-green" : "text-text-secondary")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
