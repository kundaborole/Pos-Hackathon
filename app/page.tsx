import Link from "next/link";
import { LayoutDashboard, ChefHat, MonitorSmartphone, Map, QrCode } from "lucide-react";

export default function Home() {
  const modules = [
    {
      name: "Admin Dashboard",
      description: "Live KPIs, revenue tracking, and business analytics.",
      href: "/dashboard",
      icon: LayoutDashboard,
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:border-blue-500/40",
    },
    {
      name: "Point of Sale (POS)",
      description: "Staff interface for walk-in orders and checkout.",
      href: "/pos",
      icon: MonitorSmartphone,
      color: "bg-purple-500/10 text-purple-600 border-purple-500/20 hover:border-purple-500/40",
    },
    {
      name: "Kitchen Display (KDS)",
      description: "Real-time kitchen ticket management and order routing.",
      href: "/kitchen",
      icon: ChefHat,
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:border-amber-500/40",
    },
    {
      name: "Floor Management",
      description: "Table status, reservations, and table-side ordering.",
      href: "/floor",
      icon: Map,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:border-emerald-500/40",
    },
    {
      name: "Customer QR Demo",
      description: "Select a table from the restaurant map to begin ordering.",
      href: "/demo/book",
      icon: QrCode,
      color: "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:border-rose-500/40",
    }
  ];

  return (
    <main className="min-h-screen bg-bg-base flex flex-col items-center py-20 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-16 flex flex-col items-center">
          <img src="/images/logo.png" alt="Cafe Hub Logo" className="h-20 w-20 mb-6 rounded-2xl shadow-sm" />
          <h1 className="text-5xl font-black text-text-primary mb-4 tracking-tight">Cafe Hub <span className="text-primary-green">OS</span></h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Welcome to the unified restaurant operations platform. Select a module below to enter the respective workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <Link key={mod.name} href={mod.href}>
              <div className={`flex flex-col h-full bg-white border-2 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${mod.color}`}>
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-black/5 flex items-center justify-center mb-6">
                  <mod.icon className="h-7 w-7" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{mod.name}</h2>
                <p className="text-sm text-slate-600 leading-relaxed flex-1">
                  {mod.description}
                </p>
                <div className="mt-6 flex items-center text-sm font-bold opacity-80">
                  Launch Module &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
