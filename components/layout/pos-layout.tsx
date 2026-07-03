import * as React from "react";
import { OperationalHeader } from "./operational-header";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function POSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full bg-bg-base overflow-hidden">
      <OperationalHeader 
        title="POS Terminal 1" 
        backHref="/dashboard"
        actions={
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
            <Menu className="h-5 w-5" />
          </Button>
        }
      />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
