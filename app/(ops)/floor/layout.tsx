import { requireRole } from "@/lib/auth";

export default async function FloorLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["admin", "cashier", "waiter"]);
  return <>{children}</>;
}
