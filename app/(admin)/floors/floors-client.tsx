"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit2, Plus, GripVertical, Check, AlertCircle, X, Loader2, QrCode } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

import { FloorWithTables, RestaurantTable } from "@/lib/api/floors";
import { saveFloorAction, saveTableAction, deleteTableAction } from "./actions";
import { useRouter } from "next/navigation";

type TableType = FloorWithTables['tables'][0];

export default function FloorsConfigurationClient({
  initialFloors
}: {
  initialFloors: FloorWithTables[];
}) {
  const router = useRouter();
  const [activeFloorId, setActiveFloorId] = React.useState(initialFloors[0]?.id || "");

  // Sync activeFloorId if initialFloors change and no valid floor is selected
  React.useEffect(() => {
    if (!activeFloorId && initialFloors.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveFloorId(initialFloors[0].id);
    } else if (activeFloorId && !initialFloors.find(f => f.id === activeFloorId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveFloorId(initialFloors[0]?.id || "");
    }
  }, [initialFloors, activeFloorId]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTable, setEditingTable] = React.useState<TableType | null>(null);

  const [isFloorModalOpen, setIsFloorModalOpen] = React.useState(false);
  const [editingFloor, setEditingFloor] = React.useState<FloorWithTables | null>(null);
  
  const [floorName, setFloorName] = React.useState("");
  const [floorIsActive, setFloorIsActive] = React.useState(true);
  const [isPending, startTransition] = React.useTransition();

  const activeFloor = initialFloors.find(f => f.id === activeFloorId);
  const activeFloorTables = activeFloor?.tables || [];

  const handleEditTable = (table: TableType) => {
    setEditingTable(table);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
  };

  const handleSaveTable = async (formData: FormData) => {
    startTransition(async () => {
      const tableNumber = formData.get("tableNumber") as string;
      const capacity = parseInt(formData.get("capacity") as string) || 4;
      const floorId = formData.get("floorId") as string;
      // If editingTable exists, we preserve its active status unless we added a hidden input for it, 
      // but for simplicity let's default to true on create, or preserve on edit
      const isActive = editingTable ? (editingTable.is_active ?? true) : true;
      const qrToken = editingTable?.qr_token || `qr-${Date.now()}`;

      if (!tableNumber || !floorId) return;

      const res = await saveTableAction({
        id: editingTable?.id,
        table_number: tableNumber,
        capacity,
        floor_id: floorId,
        is_active: isActive,
        qr_token: qrToken
      });
      if (res.success) {
        handleCloseModal();
        router.refresh();
      } else {
        alert("Failed to save table: " + res.error);
      }
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEditFloor = (floor: FloorWithTables) => {
    setEditingFloor(floor);
    setFloorName(floor.name);
    setFloorIsActive(floor.is_active ?? true);
    setIsFloorModalOpen(true);
  };

  const handleCloseFloorModal = () => {
    setIsFloorModalOpen(false);
    setEditingFloor(null);
    setFloorName("");
    setFloorIsActive(true);
  };

  const handleDeleteTable = (tableId: string) => {
    if (confirm("Are you sure you want to delete this table? This cannot be undone.")) {
      startTransition(async () => {
        const res = await deleteTableAction(tableId);
        if (res.success) {
          router.refresh();
        } else {
          alert("Failed to delete table: " + res.error);
        }
      });
    }
  };

  const handleSaveFloor = () => {
    if (!floorName.trim()) return;
    startTransition(async () => {
      const res = await saveFloorAction({
        id: editingFloor?.id,
        name: floorName.trim(),
        is_active: floorIsActive
      });
      if (res.success) {
        handleCloseFloorModal();
        router.refresh();
      } else {
        alert("Failed to save floor: " + res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Floors & Tables Configuration" 
        description="Manage restaurant zones, table capacities, and QR ordering tokens." 
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Table
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Floors Sidebar */}
        <div className="w-full md:w-64 flex flex-col space-y-2 bg-bg-surface p-4 rounded-xl border border-border-warm shrink-0">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-text-primary">Floors</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsFloorModalOpen(true)}><Plus className="h-4 w-4"/></Button>
          </div>
          {initialFloors.map(floor => (
            <button
              key={floor.id}
              onClick={() => setActiveFloorId(floor.id)}
              className={cn(
                "flex items-center justify-between p-3 rounded-md transition-colors text-left",
                activeFloorId === floor.id 
                  ? "bg-primary-green/10 text-primary-green font-medium" 
                  : "hover:bg-bg-secondary text-text-secondary"
              )}
            >
              <span>{floor.name}</span>
              {!floor.is_active && <span className="text-[10px] uppercase bg-bg-secondary px-1.5 py-0.5 rounded text-text-secondary">Inactive</span>}
            </button>
          ))}
          {initialFloors.length === 0 && (
            <div className="text-sm text-text-secondary py-2">No floors configured.</div>
          )}
        </div>

        {/* Tables Grid/List */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex justify-between items-center bg-bg-surface p-4 rounded-md border border-border-warm">
            <h3 className="font-semibold text-text-primary">
              Tables on {activeFloor?.name || "Selected Floor"}
            </h3>
            <div className="text-sm text-text-secondary">
              {activeFloorTables.length} tables total
            </div>
          </div>

          <div className="rounded-md border border-border-warm bg-bg-surface overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Active Status</TableHead>
                  <TableHead>QR Token</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeFloorTables.map((table) => (
                  <TableRow key={table.id}>
                    <TableCell className="font-medium text-text-primary">T-{table.table_number}</TableCell>
                    <TableCell className="text-text-secondary">{table.capacity || 2}</TableCell>
                    <TableCell>
                      <StatusBadge status={table.is_active ? "success" : "inactive"} label={table.is_active ? "Active" : "Inactive"} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-sm">
                        <QrCode className="h-4 w-4 text-primary-green" />
                        <span className="text-text-secondary">Active (Secure)</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditTable(table)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-coral hover:text-coral hover:bg-coral/10" onClick={() => handleDeleteTable(table.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {activeFloorTables.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-text-secondary">
                      No tables configured for this floor yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingTable ? "Edit Table" : "Add Table"}
      >
        <form action={handleSaveTable} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Table Number</label>
              <Input name="tableNumber" defaultValue={editingTable?.table_number || ""} placeholder="e.g. 12" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Seats</label>
              <Input name="capacity" type="number" defaultValue={editingTable?.capacity || 4} required />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Floor</label>
            <select name="floorId" defaultValue={editingTable?.floor_id || activeFloorId} className="flex h-10 w-full rounded-md border border-border-warm bg-bg-surface px-3 py-2 text-sm text-text-primary shadow-sm" required>
              {initialFloors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border-warm">
            <div>
              <div className="text-sm font-medium text-text-primary">Active Status</div>
              <div className="text-xs text-text-secondary">Can customers be seated here?</div>
            </div>
            <Switch checked={editingTable ? editingTable.is_active || false : true} readOnly />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium text-text-primary flex items-center">
                Secure QR Token <StatusBadge status="success" label="Active" className="ml-2 scale-75 origin-left" />
              </div>
              <div className="text-xs text-text-secondary">Generates a unique QR ordering link</div>
            </div>
            <Button variant="ghost" className="border border-border-warm bg-bg-surface" size="sm" type="button"><QrCode className="mr-2 h-4 w-4" /> Regenerate</Button>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-warm mt-4">
            <Button variant="ghost" type="button" onClick={handleCloseModal} disabled={isPending}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Table
            </Button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={isFloorModalOpen} 
        onClose={handleCloseFloorModal} 
        title={editingFloor ? "Edit Floor" : "Add Floor"}
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Floor Name</label>
            <Input 
              value={floorName}
              onChange={(e) => setFloorName(e.target.value)}
              placeholder="e.g. Main Dining Room" 
              disabled={isPending}
            />
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-border-warm">
            <div>
              <div className="text-sm font-medium text-text-primary">Active Status</div>
              <div className="text-xs text-text-secondary">Can customers be seated on this floor?</div>
            </div>
            <Switch 
              checked={floorIsActive} 
              onChange={(e) => setFloorIsActive(e.target.checked)}
              disabled={isPending}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-warm mt-4">
            <Button variant="ghost" onClick={handleCloseFloorModal} disabled={isPending}>Cancel</Button>
            <Button onClick={handleSaveFloor} disabled={isPending || !floorName.trim()}>
              {isPending ? "Saving..." : "Save Floor"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
