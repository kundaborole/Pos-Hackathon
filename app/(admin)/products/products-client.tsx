"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Edit2, Image as ImageIcon, Loader2 } from "lucide-react";
import { FullProduct, CategoryWithProductCount } from "@/lib/api/products";
import { saveProductAction } from "./actions";
import { useRouter } from "next/navigation";

export default function ProductsClient({
  initialProducts,
  categories
}: {
  initialProducts: FullProduct[];
  categories: CategoryWithProductCount[];
}) {
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [availabilityFilter, setAvailabilityFilter] = React.useState("");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<FullProduct | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  const filteredProducts = initialProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "" || p.category_id === categoryFilter;
    const matchesAvail = availabilityFilter === "" || 
      (availabilityFilter === "available" ? p.is_available : !p.is_available);
    
    return matchesSearch && matchesCat && matchesAvail;
  });

  const handleEdit = (product: FullProduct) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (formData: FormData) => {
    startTransition(async () => {
      const name = formData.get("name") as string;
      const category_id = formData.get("category_id") as string;
      const base_price = parseFloat(formData.get("base_price") as string) || 0;
      
      const is_available = editingProduct ? editingProduct.is_available : true;
      const send_to_kitchen = editingProduct ? editingProduct.send_to_kitchen : true;

      if (!name || !category_id) return;

      const res = await saveProductAction({
        id: editingProduct?.id,
        name,
        category_id,
        base_price,
        is_available,
        send_to_kitchen
      });
      if (res.success) {
        handleCloseDrawer();
        router.refresh();
      } else {
        alert("Failed to save product: " + res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Products Management" 
        description="Manage your menu items, pricing, and availability." 
        actions={
          <Button onClick={() => setIsDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input 
            placeholder="Search products..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
            <option value="">All Availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </Select>
        </div>
      </div>

      <div className="rounded-md border border-border-warm bg-bg-surface overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="h-10 w-10 rounded-md bg-bg-secondary flex items-center justify-center border border-border-warm overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-text-secondary opacity-50" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-text-primary">{product.name}</div>
                  <div className="text-xs text-text-secondary">{product.description}</div>
                </TableCell>
                <TableCell className="text-text-secondary">{product.category?.name || "None"}</TableCell>
                <TableCell className="font-medium">${product.base_price.toFixed(2)}</TableCell>
                <TableCell>
                  <Switch checked={product.is_available || false} readOnly />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-text-secondary">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={handleCloseDrawer} 
        title={editingProduct ? "Edit Product" : "Add Product"}
        position="right"
      >
        <form action={handleSaveProduct} className="space-y-6 pt-4 flex flex-col h-full">
          <div className="flex-1 space-y-6 overflow-y-auto pr-2 pb-20">
            <div className="space-y-4">
              <h3 className="font-semibold text-text-primary border-b border-border-warm pb-2">Basic Info</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Product Name</label>
                <Input name="name" defaultValue={editingProduct?.name || ""} placeholder="e.g. Classic Burger" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Category</label>
                <select name="category_id" defaultValue={editingProduct?.category_id || ""} className="flex h-10 w-full rounded-md border border-border-warm bg-bg-surface px-3 py-2 text-sm text-text-primary shadow-sm" required>
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Base Price ($)</label>
                <Input name="base_price" type="number" step="0.01" defaultValue={editingProduct?.base_price || ""} placeholder="0.00" required />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-text-primary border-b border-border-warm pb-2">Operational</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-text-primary">Available for Sale</div>
                  <div className="text-xs text-text-secondary">Show this item on POS and Menus</div>
                </div>
                <Switch checked={editingProduct ? editingProduct.is_available || false : true} readOnly />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-text-primary">Send to Kitchen</div>
                  <div className="text-xs text-text-secondary">Print tickets or show on KDS</div>
                </div>
                <Switch checked={editingProduct ? editingProduct.send_to_kitchen || false : true} readOnly />
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border-warm mt-auto bg-bg-surface">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Product
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
