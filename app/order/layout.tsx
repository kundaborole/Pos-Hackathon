import { CustomerMobileShell } from "@/components/layout/customer-mobile-shell";

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return <CustomerMobileShell>{children}</CustomerMobileShell>;
}
