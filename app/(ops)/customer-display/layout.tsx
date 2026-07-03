import { requireRole } from "@/lib/auth";

export default async function CustomerDisplayLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["admin", "cashier", "waiter"]);
  return <>{children}</>;
}
