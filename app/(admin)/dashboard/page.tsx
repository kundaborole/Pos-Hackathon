import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/data-table";
import { Activity, TrendingUp, TrendingDown, UtensilsCrossed, CheckCircle2 } from "lucide-react";
import { getDashboardMetrics } from "@/lib/api/metrics";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const profile = { restaurant_id: '11111111-1111-1111-1111-111111111111' };

  const metrics = await getDashboardMetrics(profile.restaurant_id);

  const kpiData = [
    { title: "Today's Revenue", value: `₹${metrics.kpis.revenue.toFixed(2)}`, trend: metrics.kpis.revenueTrend, isPositive: metrics.kpis.isRevenuePositive },
    { title: "Total Orders", value: metrics.kpis.orders.toString(), trend: metrics.kpis.ordersTrend, isPositive: metrics.kpis.isOrdersPositive },
    { title: "Avg. Ticket Size", value: `₹${metrics.kpis.avgTicket.toFixed(2)}`, trend: metrics.kpis.ticketTrend, isPositive: metrics.kpis.isTicketPositive },
    { title: "Pending Kitchen", value: metrics.kitchenPulse.pendingTickets.toString(), trend: "Current", isPositive: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Overview of today's restaurant performance." 
      />

      {/* Operational Insight Banner */}
      <Card className="bg-primary-forest text-white border-none shadow-md">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Activity className="h-6 w-6 text-primary-green" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Live Restaurant Status</h2>
              <p className="text-sm text-white/80">Service is flowing smoothly. Accept orders.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <StatusBadge status="success" label="Accepting Orders" className="bg-primary-green/20 text-white border-white/10" />
          </div>
        </CardContent>
      </Card>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{kpi.value}</div>
              <div className="flex items-center mt-1 text-sm">
                {kpi.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-primary-green mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-coral mr-1" />
                )}
                <span className={kpi.isPositive ? "text-primary-green" : "text-coral"}>
                  {kpi.trend}
                </span>
                <span className="text-text-secondary ml-2">vs yesterday</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-text-primary">Recent Orders</h3>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.recentOrders.length > 0 ? metrics.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.table}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status as any} />
                    </TableCell>
                    <TableCell className="text-text-secondary">{order.time}</TableCell>
                    <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-text-secondary">No orders today.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Right Column: Kitchen Pulse */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Kitchen Pulse</h3>
            <Card>
              <CardContent className="p-0 divide-y divide-border-warm">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <UtensilsCrossed className="h-5 w-5 text-text-secondary" />
                    <span className="text-sm font-medium">Pending Tickets</span>
                  </div>
                  <span className="font-bold text-text-primary">{metrics.kitchenPulse.pendingTickets}</span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-text-secondary" />
                    <span className="text-sm font-medium">Completed Today</span>
                  </div>
                  <span className="font-bold text-text-primary">{metrics.kitchenPulse.completedToday}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
