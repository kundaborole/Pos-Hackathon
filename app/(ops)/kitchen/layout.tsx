import { KDSLayout } from "@/components/layout/kds-layout";

export default function KDSLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <KDSLayout>{children}</KDSLayout>;
}
