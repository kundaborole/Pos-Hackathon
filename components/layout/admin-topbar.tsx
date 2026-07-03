"use client";
import * as React from "react";
import { Menu, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminTopbarProps {
  onMenuToggle?: () => void;
  className?: string;
}

export function AdminTopbar({ onMenuToggle, className }: AdminTopbarProps) {
  return (
    <header className={cn("h-16 flex items-center justify-between px-4 sm:px-6 bg-bg-surface border-b border-border-warm", className)}>
      <div className="flex items-center">
        {onMenuToggle && (
          <button 
            onClick={onMenuToggle}
            className="md:hidden mr-4 p-2 rounded-md text-text-secondary hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary-forest"
            aria-label="Toggle Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-text-secondary hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary-forest relative min-h-[44px] min-w-[44px] flex items-center justify-center">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-coral"></span>
          <span className="sr-only">Notifications</span>
        </button>
        <button className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary-forest">
          <div className="h-8 w-8 rounded-full bg-primary-green/20 text-primary-green flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        </button>
      </div>
    </header>
  );
}
