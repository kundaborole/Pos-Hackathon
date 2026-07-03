"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, CheckCircle, ChefHat, CreditCard, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { FullOrder } from "@/lib/api/orders";
import { sendOrderToKitchenAction } from "./actions";

export default function OrderDetailsClient({
  order
}: {
  order: FullOrder | null;
}) {
  const router = useRouter();
  const [isSendingToKitchen, setIsSendingToKitchen] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Order Not Found</h1>
        </div>
      </div>
    );
  }

  const handleSendToKitchen = async () => {
    setIsSendingToKitchen(true);
    setErrorMsg(null);
    try {
      const res = await sendOrderToKitchenAction(order.id);
      if (res.success) {
        router.refresh(); // Refresh page to see new status
      } else {
        setErrorMsg(res.error || "Failed to send to kitchen");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErrorMsg(e.message || "An unexpected error occurred");
    } finally {
      setIsSendingToKitchen(false);
    }
  };

  const getOrderStatus = () => {
    if (order.kitchen_status === 'pending') return 'Pending';
    if (order.kitchen_status === 'preparing') return 'Preparing';
    if (order.kitchen_status === 'completed') return 'Ready';
    if (order.order_status === 'completed') return 'Completed';
    return order.order_status;
  };

  const getOrderStatusType = () => {
    if (order.kitchen_status === 'pending') return 'inactive';
    if (order.kitchen_status === 'preparing') return 'preparing';
    if (order.kitchen_status === 'completed') return 'success';
    return 'inactive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/floor">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Order {order.order_number}</h1>
            <p className="text-sm text-text-secondary">Created at {new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary"><Printer className="h-4 w-4 mr-2" /> Receipt</Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-coral/10 text-coral border border-coral/20 rounded-md text-sm font-medium flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Items</CardTitle>
              <StatusBadge status={getOrderStatusType() as "inactive" | "success" | "preparing"} label={getOrderStatus()} />
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border-warm">
                {order.items.length > 0 ? order.items.map((item) => (
                  <div key={item.id} className="py-4 flex justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary">{item.quantity}x</span>
                        <span className="font-medium text-text-primary">{item.product_name_snapshot}</span>
                      </div>
                      {(item.variants.length > 0 || item.addons.length > 0 || item.special_instructions) && (
                        <div className="text-sm text-text-secondary ml-6 space-y-1">
                          {item.variants.length > 0 && <div>Variants: {item.variants.map(v => v.value_name_snapshot).join(', ')}</div>}
                          {item.addons.length > 0 && <div>Add-ons: {item.addons.map(a => a.addon_name_snapshot).join(', ')}</div>}
                          {item.special_instructions && <div className="text-coral">Note: {item.special_instructions}</div>}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-text-primary">${item.total_price.toFixed(2)}</div>
                      <StatusBadge 
                        status={item.kitchen_status === 'completed' ? 'success' : (item.kitchen_status === 'preparing' ? 'preparing' : 'inactive')} 
                        label={item.kitchen_status}
                        className="mt-2 scale-90 origin-right" 
                      />
                    </div>
                  </div>
                )) : (
                  <div className="py-8 text-center text-text-secondary">No items found for this order.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {order.kitchen_status === 'pending' && (
                <Button 
                  className="bg-primary-forest hover:bg-primary-forest/90"
                  onClick={handleSendToKitchen}
                  disabled={isSendingToKitchen}
                >
                  <ChefHat className="h-4 w-4 mr-2" /> 
                  {isSendingToKitchen ? "Sending..." : "Send to Kitchen"}
                </Button>
              )}
              {order.kitchen_status === 'completed' && order.order_status !== 'completed' && (
                <Button className="bg-primary-green hover:bg-primary-hover"><CheckCircle className="h-4 w-4 mr-2" /> Mark Served</Button>
              )}
              {order.payment_status === 'unpaid' && (
                <Link href={`/payment/${order.id}`}>
                  <Button className="bg-ready-blue hover:bg-ready-blue/90"><CreditCard className="h-4 w-4 mr-2" /> Take Payment</Button>
                </Link>
              )}
              <Button variant="destructive" className="ml-auto" disabled><XCircle className="h-4 w-4 mr-2" /> Cancel</Button>
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
                <span className="text-text-secondary">Table</span>
                <span className="font-medium text-text-primary">{order.table_id ? "Assigned" : "Takeaway"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Source</span>
                <span className="font-medium text-text-primary uppercase">{order.source}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Type</span>
                <span className="font-medium text-text-primary capitalize">{order.order_type?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Payment</span>
                <StatusBadge 
                  status={order.payment_status === 'paid' ? 'success' : 'inactive'} 
                  label={order.payment_status} 
                />
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
                <span className="text-text-primary">${(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Tax</span>
                <span className="text-text-primary">${(order.tax_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-border-warm">
                <span className="text-text-primary">Total</span>
                <span className="text-primary-forest">${(order.total_amount || 0).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
