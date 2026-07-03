"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, RotateCcw } from "lucide-react";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // Local state for the complex settings toggles
  const [isOpen, setIsOpen] = React.useState(true);
  const [qrOrdering, setQrOrdering] = React.useState(true);
  const [posOrdering, setPosOrdering] = React.useState(true);
  const [waiterOrdering, setWaiterOrdering] = React.useState(true);
  const [kioskOrdering, setKioskOrdering] = React.useState(false);
  const [requirePayment, setRequirePayment] = React.useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader 
        title="Restaurant Settings" 
        description="Configure your restaurant profile, operations, and order flows." 
        actions={
          <div className="flex items-center space-x-3">
            {saveSuccess && <span className="text-primary-green font-bold text-sm flex items-center animate-in fade-in"><CheckCircle2 className="mr-1 h-4 w-4"/> Saved successfully</span>}
            <Button variant="ghost"><RotateCcw className="mr-2 h-4 w-4"/> Reset Changes</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main settings) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 1 - RESTAURANT PROFILE */}
          <Card className="border border-border-warm shadow-sm">
            <CardHeader>
              <CardTitle>Restaurant Profile</CardTitle>
              <p className="text-sm text-text-secondary">Basic information about your establishment.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-32 h-32 bg-bg-secondary border border-border-warm rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-text-secondary text-sm font-medium">Logo</span>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-primary">Restaurant Name</label>
                    <Input defaultValue="Cafe Hub" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Phone Number</label>
                      <Input defaultValue="+91 98765 43210" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Email Address</label>
                      <Input defaultValue="hello@cafehub.com" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Address</label>
                <textarea 
                  className="w-full rounded-md border border-border-warm bg-white px-3 py-2 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-green min-h-[80px]"
                  defaultValue="123 Food Street, Culinary District, Mumbai 400001"
                />
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2 - OPERATIONS */}
          <Card className="border border-border-warm shadow-sm">
            <CardHeader>
              <CardTitle>Operations</CardTitle>
              <p className="text-sm text-text-secondary">Financial and regional configuration.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Currency</label>
                  <Select defaultValue="INR">
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Timezone</label>
                  <Select defaultValue="Asia/Kolkata">
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Default Tax Rate (%)</label>
                  <Input type="number" defaultValue="15.13" step="0.01" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Service Charge (%)</label>
                  <Input type="number" defaultValue="5.00" step="0.01" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary">Order Number Prefix</label>
                  <Input defaultValue="ORD" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 3 - RECEIPT SETTINGS */}
          <Card className="border border-border-warm shadow-sm">
            <CardHeader>
              <CardTitle>Receipt Settings</CardTitle>
              <p className="text-sm text-text-secondary">Customize printed and digital receipts.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Restaurant Display Name (on receipt)</label>
                <Input defaultValue="CAFE HUB" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Tax Information / GSTIN</label>
                <Input defaultValue="GSTIN: 27AAAAA0000A1Z5" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Receipt Footer Message</label>
                <textarea 
                  className="w-full rounded-md border border-border-warm bg-white px-3 py-2 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-green min-h-[80px]"
                  defaultValue="Thank you for dining with Cafe Hub.\nPlease visit us again!"
                />
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column (Toggles & Status) */}
        <div className="space-y-8">
          
          {/* SECTION 5 - RESTAURANT STATUS */}
          <Card className="border-2 border-primary-green/20 shadow-sm bg-primary-green/5">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div>
                  <h3 className="font-black text-2xl text-text-primary mb-1">Live Status</h3>
                  <p className="text-sm text-text-secondary">Toggle to pause all incoming digital orders instantly.</p>
                </div>
                <div className="flex items-center space-x-4 bg-white p-3 rounded-xl border border-border-warm shadow-sm w-full justify-between">
                  <div className={`font-bold text-lg ${isOpen ? 'text-primary-forest' : 'text-text-secondary'}`}>
                    {isOpen ? 'Accepting Orders' : 'Store Closed'}
                  </div>
                  <Switch checked={isOpen} onChange={() => setIsOpen(!isOpen)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 4 - ORDER SETTINGS */}
          <Card className="border border-border-warm shadow-sm">
            <CardHeader>
              <CardTitle>Order Flows</CardTitle>
              <p className="text-sm text-text-secondary">Enable or disable specific ordering channels.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">QR Self Ordering</div>
                  <div className="text-xs text-text-secondary">Customers order from their tables</div>
                </div>
                <Switch checked={qrOrdering} onChange={() => setQrOrdering(!qrOrdering)} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">POS Ordering</div>
                  <div className="text-xs text-text-secondary">Cashiers punch orders at register</div>
                </div>
                <Switch checked={posOrdering} onChange={() => setPosOrdering(!posOrdering)} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Waiter App</div>
                  <div className="text-xs text-text-secondary">Staff take orders on tablets</div>
                </div>
                <Switch checked={waiterOrdering} onChange={() => setWaiterOrdering(!waiterOrdering)} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">Kiosk Ordering</div>
                  <div className="text-xs text-text-secondary">Self-service kiosks at entrance</div>
                </div>
                <Switch checked={kioskOrdering} onChange={() => setKioskOrdering(!kioskOrdering)} />
              </div>

              <div className="border-t border-border-warm pt-4 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-text-primary">Require Upfront Payment</div>
                    <div className="text-xs text-text-secondary">For QR & Kiosk orders</div>
                  </div>
                  <Switch checked={requirePayment} onChange={() => setRequirePayment(!requirePayment)} />
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
