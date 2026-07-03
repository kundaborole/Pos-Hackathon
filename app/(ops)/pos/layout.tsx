import { POSLayout } from "@/components/layout/pos-layout";

export default function POSLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <POSLayout>{children}</POSLayout>;
}
