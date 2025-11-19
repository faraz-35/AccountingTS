import { createSupabaseServerClient } from "@/common/lib/supabase-server";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import { ReconciliationRow } from "./components/reconciliation-row";
import { UploadComponent } from "./components/upload-component";
import Link from "next/link";
import { Suspense } from "react";
import { reconciliationStatusLabels } from "../../(common)/types";

// Fetch bank transactions for this account
async function BankTransactionsList({ accountId }: { accountId: string }) {
  const supabase = await createSupabaseServerClient();

  const { data: transactions } = await supabase
    .from("bank_transactions")
    .select(
      `
      *,
      account:accounts!inner (
        id,
        name,
        type
      )
    `,
    )
    .eq("account_id", accountId)
    .order("date", { ascending: true })
    .order("created_at", { ascending: false });

  const processed =
    transactions?.filter((tx) => tx.status === "UNMATCHED") || [];
  const completed = transactions?.filter((tx) => tx.status === "MATCHED") || [];

  // Fetch Chart of Accounts for quick create
  const { data: coa } = await supabase
    .from("accounts")
    .select("id, name, type")
    .eq("organization_id", transactions?.[0]?.organization_id)
    .in("type", ["EXPENSE", "REVENUE"])
    .order("name");

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {processed.length}
            </div>
            <div className="text-sm text-gray-600">To Reconcile</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {completed.length}
            </div>
            <div className="text-sm text-gray-600">Matched</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {transactions?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {transactions?.length
                ? Math.round((completed.length / transactions.length) * 100)
                : 0}
              %
            </div>
            <div className="text-sm text-gray-600">Complete</div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardContent className="p-0">
          {processed.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg font-medium mb-2">
                All transactions matched!
              </div>
              <p className="text-sm">This account is fully reconciled.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {processed.map((transaction) => (
                <ReconciliationRow
                  key={transaction.id}
                  bankTx={transaction}
                  candidates={[]} // Will be populated via find action
                  coa={coa || []}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function ReconciliationPage({
  params,
}: {
  params: { accountId: string };
}) {
  const supabase = await createSupabaseServerClient();
  const { accountId } = params;

  // 1. Fetch Bank Account Info
  const { data: account } = await supabase
    .from("accounts")
    .select("name, type")
    .eq("id", accountId)
    .single();

  const accountName = account?.name || "Unknown Account";

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Account Not Found</h1>
        <p className="text-gray-600 mt-2">
          The specified bank account could not be found or you don't have access
          to it.
        </p>
        <Link href="/banking/accounts">
          <Button variant="outline">Back to Accounts</Button>
        </Link>
      </div>
    );
  }

  // 2. Filter for bank accounts only
  if (account.type !== "ASSET") {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-orange-600">
          Not a Bank Account
        </h1>
        <p className="text-gray-600 mt-2">
          This account is not set up as a bank/asset account. Please select a
          bank account for reconciliation.
        </p>
        <Link href="/banking/accounts">
          <Button variant="outline">Back to Accounts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Reconcile: {account.name}</h1>
          <p className="text-gray-600 mt-1">
            Match bank transactions with your accounting records
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <UploadComponent accountId={accountId} accountName={account.name} />
          <Link href={`/banking/accounts`}>
            <Button variant="outline">Switch Account</Button>
          </Link>
        </div>
      </div>

      <Suspense fallback={<div>Loading transactions...</div>}>
        <BankTransactionsList accountId={accountId} />
      </Suspense>
    </div>
  );
}
