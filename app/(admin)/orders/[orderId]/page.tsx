import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Printer, CheckCircle, ChefHat, CreditCard, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MOCK_ORDERS } from "@/lib/mock-data";

export default function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  // Mock finding the order
  const order = MOCK_ORDERS.find(o => o.id === params.orderId) || MOCK_ORDERS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Order {order.id}</h1>
            <p className="text-sm text-text-secondary">Created today at {order.time}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary"><Printer className="h-4 w-4 mr-2" /> Receipt</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Items</CardTitle>
              <StatusBadge status={order.status} />
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border-warm">
                {order.itemsDetail.length > 0 ? order.itemsDetail.map((item, idx) => (
                  <div key={idx} className="py-4 flex justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">{item.quantity}x</span>
                        <span className="font-medium text-text-primary">{item.name}</span>
                      </div>
                      {(item.variants || item.addons || item.instructions) && (
                        <div className="text-sm text-text-secondary ml-6 space-y-1">
                          {item.variants && <div>Variant: {item.variants}</div>}
                          {item.addons && <div>Add-on: {item.addons}</div>}
                          {item.instructions && <div className="text-coral">Note: {item.instructions}</div>}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-text-primary">${(item.price * item.quantity).toFixed(2)}</div>
                      <StatusBadge status={item.preparationStatus} className="mt-2 scale-90 origin-right" />
                    </div>
                  </div>
                )) : (
                  <div className="py-8 text-center text-text-secondary">No items found for this demo order.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button className="bg-primary-forest hover:bg-primary-forest/90"><ChefHat className="h-4 w-4 mr-2" /> Send to Kitchen</Button>
              <Button className="bg-primary-green hover:bg-primary-hover"><CheckCircle className="h-4 w-4 mr-2" /> Mark Served</Button>
              <Button className="bg-ready-blue hover:bg-ready-blue/90"><CreditCard className="h-4 w-4 mr-2" /> Take Payment</Button>
              <Button variant="destructive" className="ml-auto"><XCircle className="h-4 w-4 mr-2" /> Cancel</Button>
            </CardContent>
          </Card>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Table/Type</span>
                <span className="font-medium text-text-primary">{order.table}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Source</span>
                <span className="font-medium text-text-primary">{order.source}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Staff</span>
                <span className="font-medium text-text-primary">{order.responsibleStaff}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Payment</span>
                <StatusBadge status={order.paymentStatus} label={order.paymentStatus === 'success' ? 'Paid' : 'Unpaid'} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary">${(order.total * 0.9).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Tax (10%)</span>
                <span className="text-text-primary">${(order.total * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-border-warm">
                <span className="text-text-primary">Total</span>
                <span className="text-primary-forest">${order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 border-l-2 border-border-warm ml-2 pl-4 relative">
                {order.timeline.length > 0 ? order.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute w-3 h-3 bg-primary-green rounded-full -left-[23px] top-1 border-2 border-white"></div>
                    <p className="text-sm font-medium text-text-primary">{event.event}</p>
                    <div className="flex justify-between text-xs text-text-secondary mt-1">
                      <span>{event.time}</span>
                      <span>{event.actor}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-text-secondary italic">No timeline data available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
