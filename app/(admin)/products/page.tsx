"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Edit2, Image as ImageIcon } from "lucide-react";
import { MOCK_PRODUCTS, Product, MOCK_CATEGORIES } from "@/lib/mock-data";

export default function ProductsPage() {
  const [search, setSearch] = React.useState("");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProduct(null);
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
          <Select>
            <option value="">All Categories</option>
            {MOCK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select>
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
                  <div className="h-10 w-10 rounded-md bg-bg-secondary flex items-center justify-center border border-border-warm">
                    <ImageIcon className="h-5 w-5 text-text-secondary opacity-50" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-text-primary">{product.name}</div>
                  <div className="text-xs text-text-secondary">{product.description}</div>
                </TableCell>
                <TableCell className="text-text-secondary">{product.categoryName}</TableCell>
                <TableCell className="font-medium">${product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Switch checked={product.availableForSale} readOnly />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={handleCloseDrawer} 
        title={editingProduct ? "Edit Product" : "Add Product"}
        position="right"
      >
        <div className="space-y-6 pt-4 flex flex-col h-full">
          <div className="flex-1 space-y-6 overflow-y-auto pr-2 pb-20">
            <div className="space-y-4">
              <h3 className="font-semibold text-text-primary border-b border-border-warm pb-2">Basic Info</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Product Name</label>
                <Input defaultValue={editingProduct?.name || ""} placeholder="e.g. Classic Burger" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Category</label>
                <Select defaultValue={editingProduct?.categoryId || ""}>
                  <option value="" disabled>Select Category</option>
                  {MOCK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Price ($)</label>
                <Input type="number" defaultValue={editingProduct?.price || ""} placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-text-primary border-b border-border-warm pb-2">Operational</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-text-primary">Available for Sale</div>
                  <div className="text-xs text-text-secondary">Show this item on POS and Menus</div>
                </div>
                <Switch checked={editingProduct ? editingProduct.availableForSale : true} readOnly />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-text-primary">Send to Kitchen</div>
                  <div className="text-xs text-text-secondary">Print tickets or show on KDS</div>
                </div>
                <Switch checked={editingProduct ? editingProduct.sendToKitchen : true} readOnly />
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border-warm mt-auto bg-bg-surface">
            <Button className="w-full" onClick={handleCloseDrawer}>Save Product</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
