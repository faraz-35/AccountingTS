import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/(common)/components/ui/card";
import {
  TrendingUp,
  Scale,
  FileText,
  DollarSign,
  ArrowRight
} from "lucide-react";
import { Button } from "@/(common)/components/ui/button";

export default function ReportsDashboard() {
  const reports = [
    {
      title: "Profit & Loss",
      description: "View income, expenses, and net profit over time",
      href: "/reports/financial/profit-loss",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Balance Sheet",
      description: "Snapshot of assets, liabilities, and equity",
      href: "/reports/financial/balance-sheet",
      icon: Scale,
      color: "text-blue-600"
    }
  ];

  const quickActions = [
    {
      title: "Current Month P&L",
      description: "View this month's profit and loss",
      href: "/reports/financial/profit-loss",
      icon: DollarSign
    },
    {
      title: "Today's Balance Sheet",
      description: "Current financial position",
      href: "/reports/financial/balance-sheet",
      icon: FileText
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-gray-500 mt-2">Generate and analyze your company's financial performance</p>
        </div>
        <Button variant="outline" className="print:hidden">
          <FileText className="w-4 h-4 mr-2" />
          Export All Reports
        </Button>
      </div>

      {/* Main Reports */}
      <div className="grid md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const IconComponent = report.icon;
          return (
            <Link key={report.href} href={report.href}>
              <Card className="hover:bg-gray-50 transition cursor-pointer border-2 hover:border-blue-200 group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition ${report.color}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="mt-1">{report.description}</CardDescription>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition" />
                    <div>
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Understanding Your Reports</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Profit & Loss Statement</h4>
            <p className="mb-2">Shows your business's revenue and expenses over a specific period, revealing whether you're making a profit.</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Revenue: Money earned from sales</li>
              <li>Expenses: Costs of running your business</li>
              <li>Net Income: Revenue minus expenses</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Balance Sheet</h4>
            <p className="mb-2">Provides a snapshot of your company's financial position at a specific point in time.</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Assets: What your business owns</li>
              <li>Liabilities: What your business owes</li>
              <li>Equity: Owner's stake in the business</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
