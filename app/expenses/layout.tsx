import { DashboardLayout } from "@/common/components/layout";

export default function ExpensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
