"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Plus, Search, Edit2, MoveVertical } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { CategoryWithProductCount } from "@/lib/api/products";

export default function CategoriesClient({
  initialCategories
}: {
  initialCategories: CategoryWithProductCount[];
}) {
  const [search, setSearch] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<CategoryWithProductCount | null>(null);

  const filteredCategories = initialCategories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (category: CategoryWithProductCount) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Categories Management" 
        description="Organize your menu into clear, navigable sections." 
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        }
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input 
            placeholder="Search categories..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border border-border-warm bg-bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>
                  <button className="text-text-secondary hover:text-text-primary cursor-grab active:cursor-grabbing">
                    <MoveVertical className="h-4 w-4" />
                  </button>
                </TableCell>
                <TableCell className="font-medium text-text-primary">{cat.name}</TableCell>
                <TableCell>
                  <StatusBadge status={cat.is_active ? "success" : "inactive"} label={cat.is_active ? "Active" : "Inactive"} />
                </TableCell>
                <TableCell className="text-text-secondary">{cat.product_count || 0} items</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-text-secondary">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingCategory ? "Edit Category" : "Add Category"}
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Category Name</label>
            <Input defaultValue={editingCategory?.name || ""} placeholder="e.g. Salads" />
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-border-warm">
            <Button variant="ghost" onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleCloseModal}>Save Category</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
