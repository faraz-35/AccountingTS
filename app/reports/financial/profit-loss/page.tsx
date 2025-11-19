import { createSupabaseServerClient } from "@/common/lib/supabase-server";
import { ReportTable } from "../../../(common)/components/report-table";
import { ReportActions } from "../../../(common)/components/report-actions";
import { DateRangeFilter } from "../../../(common)/components/date-range-filter";
import { Button } from "@/common/components/ui/button";
import { PnLRow } from "../../../(common)/types";

export default async function ProfitLossPage({
  searchParams,
}: {
  searchParams: { start?: string; end?: string };
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

  // Defaults: Current Month
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const start = searchParams.start || defaultStart;
  const end = searchParams.end || defaultEnd;

  // Call RPC
  const { data: pnlData, error } = await supabase.rpc("get_pnl_report", {
    p_organization_id: orgMember.organization_id,
    p_start_date: start,
    p_end_date: end,
  });

  if (error)
    return <div className="text-red-500 p-4">Error: {error.message}</div>;

  // Map RPC result to UI types
  const rows = (pnlData || []).map((r: PnLRow) => ({
    account_id: r.account_id,
    account_code: r.account_code,
    account_name: r.account_name,
    account_type: r.account_type as "REVENUE" | "EXPENSE",
    amount: r.net_amount,
  }));

  // Separate Revenue and Expenses for display
  const revenueRows = rows.filter((row) => row.account_type === "REVENUE");
  const expenseRows = rows.filter((row) => row.account_type === "EXPENSE");

  // Calculate Net Income
  const totalRevenue = revenueRows.reduce((sum, row) => sum + row.amount, 0);
  const totalExpenses = expenseRows.reduce((sum, row) => sum + row.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  const handleExport = () => {
    // CSV Export functionality would go here
    const csvContent = [
      ["Account Code", "Account Name", "Type", "Amount"],
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
    a.download = `profit-loss-${start}-to-${end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end print:hidden">
        <h1 className="text-2xl font-bold">Profit & Loss Statement</h1>
        <form className="flex gap-2 items-end">
          <DateRangeFilter startDate={start} endDate={end} endDateMin={start} />
          <Button type="submit">Run Report</Button>
          <ReportActions onPrint={handlePrint} onExport={handleExport} />
        </form>
      </div>

      <div className="text-center mb-6 hidden print:block">
        <h1 className="text-2xl font-bold">Profit & Loss Statement</h1>
        <p className="text-gray-500">
          {start} to {end}
        </p>
      </div>

      {/* Revenue Section */}
      <ReportTable
        title="Revenue"
        rows={revenueRows}
        totalLabel="Total Revenue"
        showAccountTypeTotals={false}
      />

      {/* Expense Section */}
      <ReportTable
        title="Expenses"
        rows={expenseRows}
        totalLabel="Total Expenses"
        showAccountTypeTotals={false}
      />

      {/* Net Income Summary */}
      <div className="bg-white shadow rounded-lg p-6 print:shadow-none">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Total Revenue
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalRevenue)}
            </p>
          </div>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Total Expenses
            </h3>
            <p className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalExpenses)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              Net Income
            </h3>
            <p
              className={`text-2xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(netIncome)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
