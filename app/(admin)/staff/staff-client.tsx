"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Filter, Loader2, Edit2, ShieldAlert, RotateCcw } from "lucide-react";
import { MOCK_STAFF, StaffMember } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { createStaffAccount } from "./actions";
import { useRouter } from "next/navigation";

export default function StaffClient({ initialStaff }: { initialStaff: any[] }) {
  const router = useRouter();

  const formattedStaff = initialStaff.map(s => ({
    id: s.id,
    name: s.full_name,
    role: s.role === 'admin' ? 'Admin' : s.role === 'cashier' ? 'Cashier' : s.role === 'kitchen' ? 'Kitchen Staff' : 'Waiter',
    pin: s.staff_id || "None",
    email: s.email,
    status: s.is_active ? 'active' : 'inactive'
  }));

  const [staffList, setStaffList] = React.useState(formattedStaff);

  React.useEffect(() => {
    setStaffList(formattedStaff);
  }, [initialStaff]);
  
  const [searchQuery, setSearchQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("ALL");
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingStaff, setEditingStaff] = React.useState<StaffMember | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const filteredStaff = staffList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
    setError(null);
  };

  const handleCreateStaff = async (formData: FormData) => {
    setError(null);
    setLoading(true);

    const result = await createStaffAccount(formData);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      handleCloseModal();
      router.refresh();
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch(role) {
      case 'Admin': return 'bg-coral/10 text-coral border-coral/20';
      case 'Cashier': return 'bg-ready-blue/10 text-ready-blue border-ready-blue/20';
      case 'Kitchen Staff': return 'bg-amber/10 text-amber-600 border-amber/20';
      default: return 'bg-primary-green/10 text-primary-forest border-primary-green/20';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Staff & Roles" 
        description="Manage team members, roles, and shift assignments." 
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Staff Member
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input 
            className="pl-9" 
            placeholder="Search name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="ALL">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Cashier">Cashier</option>
            <option value="Waiter">Waiter</option>
            <option value="Kitchen Staff">Kitchen Staff</option>
          </Select>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Table Area */}
        <div className="lg:col-span-3">
          <Card className="border border-border-warm overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-bg-secondary text-text-secondary border-b border-border-warm">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Staff Member</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Assignment</th>
                    <th className="px-4 py-3 font-semibold">Shift Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className={cn("border-b border-border-warm hover:bg-bg-secondary/50", member.accountStatus === 'Inactive' && "opacity-50 grayscale")}>
                      <td className="px-4 py-3">
                        <div className="font-bold text-text-primary">{member.name}</div>
                        <div className="text-xs text-text-secondary">{member.email} • {member.staffId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getRoleBadgeStyle(member.role)}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {member.assignedTerminal || member.assignedStation || "Floating"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge 
                          status={member.shiftStatus === 'Active' ? 'success' : 'inactive'} 
                          label={member.shiftStatus} 
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
                          <Edit2 className="h-4 w-4 mr-2" /> Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredStaff.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-text-secondary font-medium">
                        No staff members found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Reference Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border border-border-warm bg-bg-surface p-5 shadow-sm">
            <h3 className="font-bold text-text-primary mb-4 flex items-center">
              <ShieldAlert className="h-5 w-5 mr-2 text-ready-blue" />
              Roles & Permissions
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="pb-3 border-b border-border-warm">
                <div className="font-bold text-coral mb-1">Admin</div>
                <div className="text-text-secondary leading-tight">Full system access including reports, settings, and staff management.</div>
              </div>
              <div className="pb-3 border-b border-border-warm">
                <div className="font-bold text-ready-blue mb-1">Cashier</div>
                <div className="text-text-secondary leading-tight">Access to POS, orders, taking payments, and register sessions.</div>
              </div>
              <div className="pb-3 border-b border-border-warm">
                <div className="font-bold text-primary-forest mb-1">Waiter</div>
                <div className="text-text-secondary leading-tight">Access to floor layout, tables, order taking, and serving status.</div>
              </div>
              <div>
                <div className="font-bold text-amber-600 mb-1">Kitchen Staff</div>
                <div className="text-text-secondary leading-tight">Access to Kitchen Display System (KDS) and preparation queues.</div>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* Add / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingStaff ? "Edit Staff Member" : "Add Staff Member"}
      >
        <form action={handleCreateStaff} className="space-y-5 pt-4">
          {error && (
            <div className="p-3 text-sm text-coral bg-coral/10 rounded-md border border-coral/20">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Full Name</label>
              <Input name="fullName" defaultValue={editingStaff?.name || ""} placeholder="e.g. Jane Doe" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Staff PIN</label>
              <Input name="staffPin" defaultValue={editingStaff?.staffId || ""} placeholder="e.g. 1234" maxLength={4} />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Email Address</label>
            <Input name="email" type="email" defaultValue={editingStaff?.email || ""} placeholder="jane@cafehub.com" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Role Assignment</label>
            <div className="text-xs text-text-secondary mb-2">Staff cannot choose roles; assigned by Admin only.</div>
            <select name="role" defaultValue={editingStaff?.role || "waiter"} className="flex h-10 w-full rounded-md border border-border-warm bg-bg-surface px-3 py-2 text-sm ring-offset-bg-base file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-forest disabled:cursor-not-allowed disabled:opacity-50 text-text-primary shadow-sm" required>
              <option value="admin">Admin</option>
              <option value="cashier">Cashier</option>
              <option value="waiter">Waiter</option>
              <option value="kitchen">Kitchen Staff</option>
            </select>
          </div>

          {editingStaff && (
            <div className="flex items-center justify-between py-2 border-y border-border-warm mt-2">
              <div>
                <div className="text-sm font-medium text-text-primary">Account Status</div>
                <div className="text-xs text-text-secondary">Disable to prevent login</div>
              </div>
              <Switch checked={editingStaff.accountStatus === 'Active'} readOnly />
            </div>
          )}

          {editingStaff && (
            <Button variant="ghost" className="w-full text-coral hover:text-coral hover:bg-coral/10 border border-coral/20">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Password
            </Button>
          )}

          {!editingStaff && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Temporary Password</label>
              <Input name="password" type="text" defaultValue="changeme123" required minLength={6} />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" type="button" onClick={handleCloseModal} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingStaff ? "Save Staff Member" : "Create Staff Member"}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
