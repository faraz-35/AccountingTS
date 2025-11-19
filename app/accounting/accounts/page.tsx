import { createSupabaseServerClient } from "@/common/lib/supabase-server";
import { Button } from "@/common/components/ui";
import { Card, CardContent } from "@/common/components/ui";
import {
  formatCurrency,
  getAccountTypeColor,
} from "@/accounting/(common)/utils";
import Link from "next/link";
import { paths } from "@/common/lib/paths";
import { AccountDialog } from "./components/account-dialog";

export default async function AccountsPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch Accounts with optional type filtering
  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .order("code", { ascending: true });

  // Group accounts by type
  const groupedAccounts =
    accounts?.reduce(
      (acc, account) => {
        if (!acc[account.type]) {
          acc[account.type] = [];
        }
        acc[account.type].push(account);
        return acc;
      },
      {} as Record<string, typeof accounts>,
    ) || {};

  const accountTypes = [
    "ASSET",
    "LIABILITY",
    "EQUITY",
    "REVENUE",
    "EXPENSE",
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Chart of Accounts</h1>
          <p className="text-gray-600 mt-1">
            Manage your organization's accounts
          </p>
        </div>
        <AccountDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {accountTypes.map((type) => {
          const typeAccounts = groupedAccounts[type] || [];
          const totalBalance = typeAccounts.reduce(
            (sum, acc) => sum + (acc.current_balance || 0),
            0,
          );
          const colors = getAccountTypeColor(type);

          return (
            <Card key={type} className="overflow-hidden">
              <CardContent className="p-4">
                <div
                  className={`${colors.bg} ${colors.text} px-2 py-1 rounded text-sm font-medium inline-block mb-2`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalBalance)}
                </div>
                <div className="text-sm text-gray-500">
                  {typeAccounts.length} accounts
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Accounts Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    System
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts?.map((account) => {
                  const colors = getAccountTypeColor(account.type);
                  return (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {account.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {account.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors.bg} ${colors.text}`}
                        >
                          {account.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {formatCurrency(account.current_balance || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {account.is_system && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            System
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!account.is_system && (
                          <div className="space-x-2">
                            <Link
                              href={`${paths.accounting.accounts}/edit/${account.id}`}
                            >
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </Link>
                            {/* Delete button will be added in next iteration */}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
