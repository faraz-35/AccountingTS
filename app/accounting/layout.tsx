import Link from "next/link";
import { paths } from "@/common/lib/paths";
import { Button } from "@/common/components/ui";

export default function AccountingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation (Simplified version of Dashboard nav) */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href={paths.dashboard.root} className="text-xl font-bold text-indigo-600">
                Acme Corp
              </Link>

              {/* Accounting Module Nav */}
              <div className="hidden md:flex space-x-4">
                <Link
                  href={paths.accounting.root}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Overview
                </Link>
                <Link
                  href={paths.accounting.accounts}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Chart of Accounts
                </Link>
                <Link
                  href={paths.accounting.journal}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Journal
                </Link>
              </div>
            </div>

            <div className="flex items-center">
              <Link href={paths.dashboard.root}>
                 <Button variant="ghost">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
