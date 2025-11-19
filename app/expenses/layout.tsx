import Link from "next/link";
import { paths } from "@/common/lib/paths";
import { Button } from "@/common/components/ui";

export default function ExpensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link
                href={paths.dashboard.root}
                className="text-xl font-bold text-indigo-600"
              >
                Acme Corp
              </Link>

              {/* Expenses Module Nav */}
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/expenses/bills"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Bills
                </Link>
                <Link
                  href="/expenses/vendors"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Vendors
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href={paths.sales.invoices}>
                <Button variant="ghost">Sales</Button>
              </Link>
              <Link href={paths.accounting.root}>
                <Button variant="ghost">Accounting</Button>
              </Link>
              <Link href={paths.dashboard.root}>
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
