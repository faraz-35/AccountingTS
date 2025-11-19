import { DashboardLayout } from "@/(common)/components/layout";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
