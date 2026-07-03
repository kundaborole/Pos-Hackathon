import { POSLayout } from "@/components/layout/pos-layout";
import { requireRole } from "@/lib/auth";

export default async function POSLayoutWrapper({ children }: { children: React.ReactNode }) {
  await requireRole(["admin", "cashier"]);
  return <POSLayout>{children}</POSLayout>;
}
