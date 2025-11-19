import { createSupabaseServerClient } from "@/(common)/lib/supabase-server";
import { ReportTable } from "../../(common)/components/report-table";
import { ReportActions } from "../../(common)/components/report-actions";
import { Button } from "@/(common)/components/ui/button";
import { Input } from "@/(common)/components/ui/input";
import { Label } from "@/(common)/components/ui/label";
import { BalanceSheetRow } from "../../(common)/types";

export default async function BalanceSheetPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: orgMember } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user?.id)
    .single();

  if (!orgMember) return <div>No Organization Found</div>;

  const asOfDate = searchParams.date || new Date().toISOString().split("T")[0];

  const { data: bsData, error } = await supabase.rpc("get_balance_sheet", {
    p_organization_id: orgMember.organization_id,
    p_as_of_date: asOfDate,
  });

  if (error)
    return <div className="text-red-500 p-4">Error: {error.message}</div>;

  // Map RPC result to UI types
  const rows = (bsData || []).map((r: BalanceSheetRow) => ({
    account_id: r.account_id,
    account_code: r.account_code,
    account_name: r.account_name,
    account_type: r.account_type as "ASSET" | "LIABILITY" | "EQUITY",
    amount: r.balance,
  }));

  // Separate by type for proper Balance Sheet presentation
  const assetRows = rows.filter((row) => row.account_type === "ASSET");
  const liabilityRows = rows.filter((row) => row.account_type === "LIABILITY");
  const equityRows = rows.filter((row) => row.account_type === "EQUITY");

  // Calculate totals
  const totalAssets = assetRows.reduce((sum, row) => sum + row.amount, 0);
  const totalLiabilities = liabilityRows.reduce(
    (sum, row) => sum + row.amount,
    0,
  );
  const totalEquity = equityRows.reduce((sum, row) => sum + row.amount, 0);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  // Verify Accounting Equation: Assets should equal Liabilities + Equity
  const balanceDifference = Math.abs(totalAssets - totalLiabilitiesAndEquity);
  const isBalanced = balanceDifference < 0.01; // Allow for rounding errors

  const handleExport = () => {
    // CSV Export functionality
    const csvContent = [
      ["Account Code", "Account Name", "Type", "Balance"],
      ...rows.map((row) => [
        row.account_code,
        row.account_name,
        row.account_type,
        row.amount.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `balance-sheet-${asOfDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end print:hidden">
        <h1 className="text-2xl font-bold">Balance Sheet</h1>
        <form className="flex gap-2 items-end">
          <div>
            <Label htmlFor="date" className="text-xs font-bold">
              As Of Date
            </Label>
            <Input
              type="date"
              id="date"
              name="date"
              defaultValue={asOfDate}
              required
            />
          </div>
          <Button type="submit">Run Report</Button>
          <ReportActions onPrint={handlePrint} onExport={handleExport} />
        </form>
      </div>

      <div className="text-center mb-6 hidden print:block">
        <h1 className="text-2xl font-bold">Balance Sheet</h1>
        <p className="text-gray-500">As of {asOfDate}</p>
      </div>

      {/* Assets Section */}
      <ReportTable
        title="Assets"
        rows={assetRows}
        totalLabel="Total Assets"
        showAccountTypeTotals={false}
      />

      {/* Liabilities Section */}
      <ReportTable
        title="Liabilities"
        rows={liabilityRows}
        totalLabel="Total Liabilities"
        showAccountTypeTotals={false}
      />

      {/* Equity Section */}
      <ReportTable
        title="Equity"
        rows={equityRows}
        totalLabel="Total Equity"
        showAccountTypeTotals={false}
      />

      {/* Balance Sheet Summary */}
      <div className="bg-white shadow rounded-lg p-6 print:shadow-none">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b">
          Balance Sheet Summary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Total Assets
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalAssets)}
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Total Liabilities
            </h3>
            <p className="text-2xl font-bold text-orange-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalLiabilities)}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Total Equity
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalEquity)}
            </p>
          </div>
        </div>

        <div className="border-t-2 border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Assets
              </h3>
              <p className="text-xl font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(totalAssets)}
              </p>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                Liabilities + Equity
              </h3>
              <p className="text-xl font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(totalLiabilitiesAndEquity)}
              </p>
            </div>
          </div>
        </div>

        {!isBalanced && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Warning! </strong>
            <span className="block sm:inline">
              Balance Sheet is out of balance by{" "}
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(balanceDifference)}
              . Please check for draft entries or data corruption.
            </span>
          </div>
        )}

        {isBalanced && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong className="font-bold">✓ Balanced</strong>
            <span className="block sm:inline ml-2">
              The accounting equation (Assets = Liabilities + Equity) is in
              balance.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
