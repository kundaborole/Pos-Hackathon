"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, ShoppingBag, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavigationProps {
  tableToken: string;
}

export function MobileBottomNavigation({ tableToken }: MobileBottomNavigationProps) {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Menu", href: `/order/${tableToken}/menu`, icon: Coffee },
    { name: "Cart", href: `/order/${tableToken}/cart`, icon: ShoppingBag },
    { name: "Order", href: `/order/${tableToken}/track/latest`, icon: Receipt },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-bg-surface border-t border-border-warm pb-safe">
      <nav className="flex justify-around items-center h-16 w-full px-4">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.href) || (item.name === "Menu" && pathname === `/order/${tableToken}`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 min-h-[44px]",
                isActive ? "text-primary-green" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive && "fill-primary-green/20")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
