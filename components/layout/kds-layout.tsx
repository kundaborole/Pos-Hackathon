import * as React from "react";
import { OperationalHeader } from "./operational-header";

export function KDSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full bg-bg-surface overflow-hidden">
      <OperationalHeader 
        title="Kitchen Display" 
        backHref="/dashboard"
        className="bg-text-primary"
      />
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-4 bg-bg-secondary">
        {children}
      </main>
    </div>
  );
}
