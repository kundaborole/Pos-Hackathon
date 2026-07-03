import { KDSLayout } from "@/components/layout/kds-layout";
import { requireRole } from "@/lib/auth";

export default async function KDSLayoutWrapper({ children }: { children: React.ReactNode }) {
  await requireRole(["admin", "kitchen"]);
  return <KDSLayout>{children}</KDSLayout>;
}
