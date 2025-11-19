import { DashboardLayout } from "@/(common)/components/layout";

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
