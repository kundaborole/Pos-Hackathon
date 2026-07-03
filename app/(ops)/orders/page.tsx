"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, ChevronRight } from "lucide-react";
import { MOCK_ORDERS } from "@/lib/mock-data";

export default function OrdersPage() {
  const [search, setSearch] = React.useState("");
  
  const filteredOrders = MOCK_ORDERS.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    o.table.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Orders Management" 
        description="Track and manage all restaurant orders in real-time." 
      />

      {/* Advanced Filters */}
      <div className="bg-bg-surface p-4 rounded-md border border-border-warm flex flex-col sm:flex-row gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input 
            placeholder="Search Order ID or Table..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto min-w-[140px]">
          <Select>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
          </Select>
        </div>
        <div className="w-full sm:w-auto min-w-[140px]">
          <Select>
            <option value="">All Sources</option>
            <option value="POS">POS</option>
            <option value="Waiter">Waiter</option>
            <option value="QR Self Order">QR Self Order</option>
            <option value="Kiosk">Kiosk</option>
          </Select>
        </div>
        <div className="w-full sm:w-auto min-w-[140px]">
          <Select>
            <option value="">All Statuses</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="success">Completed</option>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-md border border-border-warm bg-bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Table/Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Kitchen Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-text-primary">{order.id}</TableCell>
                <TableCell className="text-text-secondary">{order.time}</TableCell>
                <TableCell className="font-medium">{order.table}</TableCell>
                <TableCell className="text-text-secondary text-sm">{order.source}</TableCell>
                <TableCell className="text-text-secondary">{order.items} items</TableCell>
                <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.paymentStatus} label={order.paymentStatus === 'success' ? 'Paid' : 'Unpaid'} />
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
