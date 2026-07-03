"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit2, Trash2, QrCode } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { FloorWithTables } from "@/lib/api/floors";

type TableType = FloorWithTables['tables'][0];

export default function FloorsConfigurationClient({
  initialFloors
}: {
  initialFloors: FloorWithTables[];
}) {
  const [activeFloorId, setActiveFloorId] = React.useState(initialFloors[0]?.id || "");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTable, setEditingTable] = React.useState<TableType | null>(null);

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
            <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="h-4 w-4"/></Button>
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
                      <Button variant="ghost" size="icon" className="text-coral hover:text-coral hover:bg-coral/10">
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
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Table Number</label>
              <Input defaultValue={editingTable?.table_number || ""} placeholder="e.g. 12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">Seats</label>
              <Input type="number" defaultValue={editingTable?.capacity || 4} />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Floor</label>
            <Select defaultValue={editingTable?.floor_id || activeFloorId}>
              {initialFloors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </Select>
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
            <Button variant="ghost" onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleCloseModal}>Save Table</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
