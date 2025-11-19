import { createSupabaseServerClient } from "@/common/lib/supabase-server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui";
import { formatCurrency } from "@/accounting/(common)/utils";
import { Badge } from "@/common/components/ui/badge";
import { CheckCircle, AlertTriangle } from "lucide-react";
import React from "react";

export default async function TrialBalancePage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const supabase = await createSupabaseServerClient();

  // Default to today's date if not provided
  const asOfDate = searchParams?.date || new Date().toISOString().split("T")[0];

  try {
    // Get user's organization first
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (!orgMember) {
      throw new Error("Organization not found");
    }

    // Get trial balance data
    const { data: trialBalance, error: tbError } = await supabase.rpc(
      "get_trial_balance",
      {
        p_organization_id: orgMember.organization_id,
        p_as_of_date: asOfDate,
      },
    );

    // Get trial balance summary for validation
    const { data: summary, error: summaryError } = await supabase.rpc(
      "get_trial_balance_summary",
      {
        p_organization_id: orgMember.organization_id,
        p_as_of_date: asOfDate,
      },
    );

    if (tbError || summaryError) {
      throw new Error(tbError?.message || summaryError?.message);
    }

    const summaryData = summary?.[0];
    const isBalanced = summaryData?.is_balanced ?? false;

    // Group accounts by type
    const groupedAccounts =
      trialBalance?.reduce(
        (acc, account) => {
          if (!acc[account.account_type]) {
            acc[account.account_type] = [];
          }
          acc[account.account_type].push(account);
          return acc;
        },
        {} as Record<string, typeof trialBalance>,
      ) || {};

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Trial Balance</h1>
            <p className="text-gray-600 mt-1">
              Verify that debits equal credits as of{" "}
              {new Date(asOfDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Validation Status Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isBalanced ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {isBalanced ? "Balanced" : "Out of Balance"}
                  </h3>
                  <p className="text-gray-600">
                    Total Debits:{" "}
                    {formatCurrency(summaryData?.total_debits || 0)} | Total
                    Credits: {formatCurrency(summaryData?.total_credits || 0)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={isBalanced ? "default" : "destructive"}
                  className={isBalanced ? "bg-green-100 text-green-800" : ""}
                >
                  {isBalanced
                    ? "✓ Valid"
                    : `⚠ Diff: ${formatCurrency(Math.abs(summaryData?.difference || 0))}`}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trial Balance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Trial Balance Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Debit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Credit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(groupedAccounts).map(
                    ([accountType, accounts]) => (
                      <React.Fragment key={accountType}>
                        <tr className="bg-gray-50">
                          <td
                            colSpan={6}
                            className="px-6 py-2 text-sm font-semibold text-gray-700"
                          >
                            {accountType}
                          </td>
                        </tr>
                        {accounts.map((account) => (
                          <tr
                            key={account.account_id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {account.account_code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {account.account_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline">
                                {account.account_type}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                              {formatCurrency(account.total_debit || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                              {formatCurrency(account.total_credit || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                              {formatCurrency(account.net_balance || 0)}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ),
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr className="font-semibold">
                    <td colSpan={3} className="px-6 py-4 text-sm text-gray-900">
                      TOTALS
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                      {formatCurrency(summaryData?.total_debits || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                      {formatCurrency(summaryData?.total_credits || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                      {formatCurrency(summaryData?.difference || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Trial Balance</h1>
            <p className="text-gray-600 mt-1">
              Verify that debits equal credits
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">
                Error Loading Trial Balance
              </h3>
              <p className="text-gray-600">
                {error instanceof Error
                  ? error.message
                  : "Unknown error occurred"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
