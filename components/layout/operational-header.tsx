import * as React from "react";
import Link from "next/link";
import { ConnectionStatus } from "@/components/ui/connection-status";
import { ArrowLeft, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OperationalHeaderProps {
  title: string;
  backHref?: string;
  className?: string;
  actions?: React.ReactNode;
}

export function OperationalHeader({ title, backHref, className, actions }: OperationalHeaderProps) {
  // In a real app, this would be a real-time clock
  const time = "14:30"; 

  return (
    <header className={cn("h-16 flex items-center justify-between px-4 sm:px-6 bg-primary-forest text-white shrink-0", className)}>
      <div className="flex items-center space-x-4">
        {backHref && (
          <Link 
            href={backHref}
            className="p-2 -ml-2 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        )}
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-6">
        {actions}
        <div className="hidden sm:flex items-center space-x-2 text-white/80">
          <Clock className="h-4 w-4" />
          <span className="font-medium tracking-wide">{time}</span>
        </div>
        <ConnectionStatus isConnected={true} className="bg-white/10 text-white border-none" />
      </div>
    </header>
  );
}
