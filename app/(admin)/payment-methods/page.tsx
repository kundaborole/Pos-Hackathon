"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Banknote, QrCode } from "lucide-react";
import { MOCK_PAYMENT_METHODS } from "@/lib/mock-data";

export default function PaymentMethodsConfigPage() {
  const [methods, setMethods] = React.useState(MOCK_PAYMENT_METHODS);

  const toggleMethod = (id: string) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const cash = methods.find(m => m.type === 'cash');
  const card = methods.find(m => m.type === 'card');
  const upi = methods.find(m => m.type === 'upi');

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Payment Methods" 
        description="Configure which payment options are available on the POS and self-ordering." 
        actions={
          <Button>Save Changes</Button>
        }
      />

      <div className="max-w-3xl space-y-4">
        
        {/* Cash */}
        {cash && (
          <Card className="border border-border-warm bg-bg-surface overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted-gold/10 rounded-full flex items-center justify-center">
                  <Banknote className="h-6 w-6 text-muted-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-primary">{cash.name}</h3>
                  <p className="text-sm text-text-secondary">Accept physical currency at the register.</p>
                </div>
              </div>
              <Switch checked={cash.active} onChange={() => toggleMethod(cash.id)} />
            </div>
          </Card>
        )}

        {/* Card */}
        {card && (
          <Card className="border border-border-warm bg-bg-surface overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-ready-blue/10 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-ready-blue" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-primary">{card.name}</h3>
                  <p className="text-sm text-text-secondary">Process credit and debit cards via terminal.</p>
                </div>
              </div>
              <Switch checked={card.active} onChange={() => toggleMethod(card.id)} />
            </div>
          </Card>
        )}

        {/* UPI */}
        {upi && (
          <Card className="border border-border-warm bg-bg-surface overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-border-warm">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-green/10 rounded-full flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-primary-green" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-primary">{upi.name}</h3>
                  <p className="text-sm text-text-secondary">Accept payments via GPay, PhonePe, Paytm, etc.</p>
                </div>
              </div>
              <Switch checked={upi.active} onChange={() => toggleMethod(upi.id)} />
            </div>
            
            {upi.active && (
              <CardContent className="p-6 bg-bg-secondary/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">UPI ID</label>
                      <Input defaultValue={upi.upiId} placeholder="e.g. restaurant@bank" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-text-primary">Merchant Display Name</label>
                      <Input defaultValue={upi.upiName} placeholder="e.g. Cafe Hub" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-medium text-text-secondary mb-2">QR Preview</span>
                    <div className="w-32 h-32 bg-white border border-border-warm rounded-lg shadow-sm flex items-center justify-center relative overflow-hidden">
                      <QrCode className="h-16 w-16 text-text-secondary opacity-20" />
                      <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover opacity-80 mix-blend-multiply"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

      </div>
    </div>
  );
}
