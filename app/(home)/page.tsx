import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/(common)/components/ui";
import { paths } from "@/(common)/lib/paths";
import {
  Building2,
  Users,
  ShoppingCart,
  Receipt,
  TrendingUp,
  PlusCircle,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your accounting management system
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={paths.accounting.accounts}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chart of Accounts
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage</div>
              <p className="text-xs text-muted-foreground">
                Create and manage accounts
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={paths.sales.customers}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage</div>
              <p className="text-xs text-muted-foreground">Customer database</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={paths.sales.invoices}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoices</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Create</div>
              <p className="text-xs text-muted-foreground">Generate invoices</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href={paths.expenses.vendors}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendors</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Manage</div>
              <p className="text-xs text-muted-foreground">
                Vendor relationships
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PlusCircle className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href={paths.accounting.accounts}>
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium">Create New Account</h4>
                <p className="text-sm text-gray-600">
                  Add accounts to your chart of accounts
                </p>
              </div>
            </Link>

            <Link href={paths.sales.invoices}>
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium">Create Invoice</h4>
                <p className="text-sm text-gray-600">
                  Generate new customer invoice
                </p>
              </div>
            </Link>

            <Link href={paths.expenses.bills}>
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium">Add Bill</h4>
                <p className="text-sm text-gray-600">Record vendor bill</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href={paths.accounting.reports.trialBalance}>
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium">Trial Balance</h4>
                <p className="text-sm text-gray-600">Verify account balances</p>
              </div>
            </Link>

            <Link href={paths.accounting.reports.profitLoss}>
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium">Profit & Loss</h4>
                <p className="text-sm text-gray-600">
                  Income and expense statement
                </p>
              </div>
            </Link>

            <Link href={paths.accounting.reports.balanceSheet}>
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <h4 className="font-medium">Balance Sheet</h4>
                <p className="text-sm text-gray-600">
                  Assets, liabilities, and equity
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
