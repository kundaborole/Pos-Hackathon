"use client";
import * as React from "react";
import { Menu, Bell, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { logoutAction } from "@/app/(auth)/actions";

export interface AdminTopbarProps {
  onMenuToggle?: () => void;
  className?: string;
  profile?: Database['public']['Tables']['profiles']['Row'];
}

export function AdminTopbar({ onMenuToggle, className, profile }: AdminTopbarProps) {
  const [showNotifications, setShowNotifications] = React.useState(false);

  // Close dropdown when clicking outside
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: "New Order", message: "Table 4 just placed an order via QR code.", time: "2 min ago", read: false },
    { id: 2, title: "Low Stock", message: "Coffee Beans are running low (under 10%).", time: "1 hr ago", read: false },
    { id: 3, title: "Server Alert", message: "Kitchen requests assistance at the expo station.", time: "2 hrs ago", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;
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
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "p-2 rounded-full text-text-secondary hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-primary-forest relative min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors",
              showNotifications && "bg-bg-secondary text-primary-forest"
            )}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-coral border-2 border-bg-surface"></span>
            )}
            <span className="sr-only">Notifications</span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-border-warm overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="px-4 py-3 border-b border-border-warm flex justify-between items-center bg-bg-base">
                <h3 className="font-bold text-text-primary text-sm">Notifications</h3>
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">{unreadCount} New</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="flex flex-col divide-y divide-border-warm">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={cn(
                          "px-4 py-3 hover:bg-bg-base transition-colors cursor-pointer",
                          !notification.read && "bg-primary-forest/5"
                        )}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className={cn("text-sm font-semibold", !notification.read ? "text-primary-forest" : "text-text-primary")}>
                            {notification.title}
                          </h4>
                          <span className="text-[10px] text-text-secondary whitespace-nowrap ml-2">{notification.time}</span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-text-secondary">
                    No new notifications
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-border-warm bg-bg-base">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="w-full text-xs font-bold text-primary-forest hover:text-primary-hover py-1.5 text-center transition-colors rounded-md hover:bg-primary-forest/10"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-text-primary">{profile?.full_name || 'Staff'}</p>
            <p className="text-xs text-text-secondary capitalize">{profile?.role || 'Guest'}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary-green/20 text-primary-green flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <button 
            onClick={() => logoutAction()}
            className="ml-2 p-2 rounded-md text-text-secondary hover:bg-coral/10 hover:text-coral transition-colors focus:outline-none focus:ring-2 focus:ring-coral/50"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
