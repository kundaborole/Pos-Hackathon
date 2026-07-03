"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Download, FileText, Filter } from "lucide-react";
import { 
  MOCK_SALES_TREND, 
  MOCK_PAYMENT_SPLIT, 
  MOCK_TOP_PRODUCTS, 
  MOCK_SESSION_PERFORMANCE 
} from "@/lib/mock-data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ['#08783F', '#347FC4', '#F2A51A', '#C89B45'];

export default function ReportsPage() {
  const [period, setPeriod] = React.useState("today");
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = (type: string) => {
    console.log("Exporting", type);
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reports & Analytics" 
        description="Track restaurant performance, sales and operations." 
        actions={
          <div className="flex items-center space-x-2">
            <Button variant="secondary" onClick={() => handleExport('pdf')} disabled={isExporting}>
              <FileText className="mr-2 h-4 w-4" /> {isExporting ? 'Exporting...' : 'Export PDF'}
            </Button>
            <Button variant="secondary" onClick={() => handleExport('xls')} disabled={isExporting}>
              <Download className="mr-2 h-4 w-4" /> Export XLS
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-bg-surface border border-border-warm rounded-lg p-4 flex flex-wrap gap-4 items-end">
        <div className="w-48 space-y-1">
          <label className="text-xs font-medium text-text-secondary">Period</label>
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </Select>
        </div>
        <div className="w-48 space-y-1">
          <label className="text-xs font-medium text-text-secondary">Session</label>
          <Select>
            <option value="all">All Sessions</option>
            <option value="ses-024">SES-024 (Active)</option>
          </Select>
        </div>
        <div className="w-48 space-y-1">
          <label className="text-xs font-medium text-text-secondary">Staff</label>
          <Select>
            <option value="all">All Staff</option>
            <option value="rahul">Rahul Sharma</option>
          </Select>
        </div>
        <Button className="font-bold">
          <Filter className="mr-2 h-4 w-4" /> Apply Filters
        </Button>
        <Button variant="ghost" onClick={() => setPeriod('today')}>Reset Filters</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border-warm shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-text-secondary mb-1">Total Sales</div>
            <div className="text-3xl font-black text-primary-forest">₹1,24,580</div>
          </CardContent>
        </Card>
        <Card className="border border-border-warm shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-text-secondary mb-1">Total Orders</div>
            <div className="text-3xl font-black text-text-primary">342</div>
          </CardContent>
        </Card>
        <Card className="border border-border-warm shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-text-secondary mb-1">Average Order Value</div>
            <div className="text-3xl font-black text-text-primary">₹364</div>
          </CardContent>
        </Card>
        <Card className="border border-border-warm shadow-sm">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-text-secondary mb-1">Completed Orders</div>
            <div className="text-3xl font-black text-text-primary">318</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Trend Chart */}
        <Card className="border border-border-warm shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_SALES_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#08783F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#08783F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7DFD2" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#66706B', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#66706B', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E7DFD2', backgroundColor: '#FFFDF8' }}
                    itemStyle={{ color: '#092F2A', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#08783F" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Split */}
        <Card className="border border-border-warm shadow-sm">
          <CardHeader>
            <CardTitle>Payment Method Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_PAYMENT_SPLIT}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="amount"
                  >
                    {MOCK_PAYMENT_SPLIT.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E7DFD2', backgroundColor: '#FFFDF8' }}
                    itemStyle={{ color: '#092F2A', fontWeight: 'bold' }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => `₹${Number(value || 0).toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-2">
              {MOCK_PAYMENT_SPLIT.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="font-medium text-text-primary">{item.method}</span>
                  </div>
                  <div className="font-bold text-text-primary">₹{item.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Products */}
        <Card className="border border-border-warm shadow-sm">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-bg-secondary text-text-secondary border-y border-border-warm">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold text-right">Qty</th>
                  <th className="px-4 py-3 font-semibold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TOP_PRODUCTS.map((prod) => (
                  <tr key={prod.id} className="border-b border-border-warm hover:bg-bg-secondary/50">
                    <td className="px-4 py-3 font-medium text-text-primary">{prod.name}</td>
                    <td className="px-4 py-3 text-right">{prod.quantitySold}</td>
                    <td className="px-4 py-3 text-right font-bold text-primary-forest">₹{prod.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Session Performance */}
        <Card className="border border-border-warm shadow-sm">
          <CardHeader>
            <CardTitle>Session Performance</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-bg-secondary text-text-secondary border-y border-border-warm">
                <tr>
                  <th className="px-4 py-3 font-semibold">Session</th>
                  <th className="px-4 py-3 font-semibold">Cashier</th>
                  <th className="px-4 py-3 font-semibold text-right">Sales</th>
                  <th className="px-4 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SESSION_PERFORMANCE.map((ses) => (
                  <tr key={ses.sessionId} className="border-b border-border-warm hover:bg-bg-secondary/50">
                    <td className="px-4 py-3 font-bold text-text-primary">{ses.sessionId}</td>
                    <td className="px-4 py-3">{ses.cashier}</td>
                    <td className="px-4 py-3 text-right font-bold">₹{ses.sales.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${ses.status === 'Active' ? 'bg-primary-green/10 text-primary-green' : 'bg-bg-secondary text-text-secondary'}`}>
                        {ses.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
}
