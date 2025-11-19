import { createSupabaseServerClient } from "@/(common)/lib/supabase-server";
import { BillForm } from "./components/bill-form";
import { Button } from "@/(common)/components/ui";
import Link from "next/link";
import BillListClient from "./components/bill-list-client";

// Bill list server component
async function BillList() {
  const supabase = await createSupabaseServerClient();

  const { data: bills } = await supabase
    .from("bills")
    .select(`
      *,
      vendor (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <BillListClient bills={bills || []} />
  );
}

export default async function BillsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createSupabaseServerClient();

  // Fetch data for the form
  const [vendors, expenseAccounts, apAccounts, assetAccounts] = await Promise.all([
    supabase.from("vendors").select("*").order("name"),
    supabase.from("accounts").select("*").in("type", ["EXPENSE", "ASSET"]).order("code"),
    supabase.from("accounts").select("*").eq("type", "LIABILITY").ilike("name", "%payable%").order("code"),
    supabase.from("accounts").select("*").eq("type", "ASSET").ilike("name", "%bank%").order("code"),
  ]);

  // Check if we're creating a new bill for a specific vendor
  const vendorId = searchParams?.vendor as string;
  const isNewBill = searchParams?.new === "true" || !!vendorId;

  if (isNewBill) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">New Bill</h1>
            <p className="text-gray-600 mt-1">Record vendor expenses and bills</p>
          </div>
          <Link href="/expenses/bills">
            <Button variant="outline">Back to Bills</Button>
          </Link>
        </div>

        <BillForm
          vendors={vendors.data || []}
          expenseAccounts={expenseAccounts.data || []}
          apAccounts={apAccounts.data || []}
          initialData={vendorId ? { vendor_id: vendorId } : undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Bills</h1>
          <p className="text-gray-600 mt-1">Manage your vendor bills and expenses</p>
        </div>
        <Link href="/expenses/bills?new=true">
          <Button>New Bill</Button>
        </Link>
      </div>

      <BillList />
    </div>
  );
}
