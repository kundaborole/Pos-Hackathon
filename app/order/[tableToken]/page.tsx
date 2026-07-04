import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomerMobileShell } from "@/components/layout/customer-mobile-shell";
import { CheckCircle2, Utensils, Bell } from "lucide-react";
import { GuestCounter } from "./guest-counter";
import { validateTableSession } from "@/lib/api/customer";
import { notFound } from "next/navigation";

export default async function TableWelcomePage({ params }: { params: Promise<{ tableToken: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.tableToken;
  
  const session = await validateTableSession(token);
  if (!session) return notFound();

  return (
    <CustomerMobileShell hideNav={true}>
      <div className="flex flex-col min-h-screen bg-bg-surface items-center justify-center p-6 text-center">
        
        <div className="w-24 h-24 bg-primary-green/10 rounded-full flex items-center justify-center mb-8">
          <Utensils className="h-10 w-10 text-primary-forest" />
        </div>

        <h1 className="text-3xl font-black text-text-primary mb-2">{session.restaurant_name}</h1>
        <p className="text-text-secondary font-medium mb-12">Scan, order, and pay seamlessly.</p>

        <div className="w-full bg-white border border-border-warm rounded-2xl p-6 shadow-sm mb-8 space-y-4">
          <div className="flex items-center justify-center space-x-2 text-primary-green mb-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-bold text-sm">Table Verified</span>
          </div>
          
          <div className="text-3xl font-black text-text-primary">{session.floor_name} - Table {session.table_number}</div>
          <div className="inline-block bg-bg-secondary px-3 py-1 rounded-full text-sm font-bold text-text-secondary uppercase tracking-widest">
            Dine In
          </div>

          <GuestCounter maxCapacity={session.capacity} />
        </div>

        <div className="w-full mt-auto space-y-3">
          <Link href={`/order/${token}/menu`} className="block w-full">
            <Button className="w-full h-14 text-lg font-bold">Start Ordering</Button>
          </Link>
          <Button variant="secondary" className="w-full h-14 text-base font-bold bg-white text-text-secondary border-border-warm hover:bg-bg-secondary">
            <Bell className="mr-2 h-5 w-5" /> Call Waiter
          </Button>
        </div>

      </div>
    </CustomerMobileShell>
  );
}
