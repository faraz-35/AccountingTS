import { DashboardLayout } from "@/common/components/layout";

export default function AccountingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
