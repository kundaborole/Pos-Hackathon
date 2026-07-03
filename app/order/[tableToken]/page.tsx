import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CustomerMobileShell } from "@/components/layout/customer-mobile-shell";
import { CheckCircle2, Utensils, Bell } from "lucide-react";

export default function TableWelcomePage({ params }: { params: { tableToken: string } }) {
  // Normally tableToken would be used to fetch actual table data.
  // We use mock Table 03 as requested.
  const token = params.tableToken;

  return (
    <CustomerMobileShell hideNav={true}>
      <div className="flex flex-col min-h-screen bg-bg-surface items-center justify-center p-6 text-center">
        
        <div className="w-24 h-24 bg-primary-green/10 rounded-full flex items-center justify-center mb-8">
          <Utensils className="h-10 w-10 text-primary-forest" />
        </div>

        <h1 className="text-3xl font-black text-text-primary mb-2">Cafe Hub</h1>
        <p className="text-text-secondary font-medium mb-12">Scan, order, and pay seamlessly.</p>

        <div className="w-full bg-white border border-border-warm rounded-2xl p-6 shadow-sm mb-8 space-y-4">
          <div className="flex items-center justify-center space-x-2 text-primary-green mb-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-bold text-sm">Table Verified</span>
          </div>
          
          <div className="text-4xl font-black text-text-primary">Table 03</div>
          <div className="inline-block bg-bg-secondary px-3 py-1 rounded-full text-sm font-bold text-text-secondary uppercase tracking-widest">
            Dine In
          </div>

          <div className="pt-6 border-t border-border-warm mt-6">
            <label className="text-sm font-bold text-text-secondary block mb-3">Number of Guests</label>
            <div className="flex items-center justify-center space-x-4">
              <button className="w-10 h-10 rounded-full border-2 border-border-warm flex items-center justify-center text-text-primary text-xl font-bold hover:bg-bg-secondary active:scale-95 transition-all">-</button>
              <div className="w-12 text-center text-2xl font-black">2</div>
              <button className="w-10 h-10 rounded-full border-2 border-primary-green bg-primary-green flex items-center justify-center text-white text-xl font-bold hover:bg-primary-hover active:scale-95 transition-all">+</button>
            </div>
          </div>
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
