import { createSupabaseServerClient } from "@/(common)/lib/supabase-server";
import { InvoiceForm } from "./components/invoice-form";
import { Button } from "@/(common)/components/ui";
import { Card, CardContent } from "@/(common)/components/ui";
import { invoiceStatusLabels, getInvoiceStatusColor } from "../(common)/types";
import { formatCurrency } from "@/accounting/(common)/utils";
import Link from "next/link";
import { Suspense } from "react";

// Invoice list component
async function InvoiceList() {
  const supabase = await createSupabaseServerClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select(`
      *,
      customer (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices?.map((invoice) => {
                const statusColor = getInvoiceStatusColor(invoice.status);
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.customer?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {formatCurrency(invoice.total_amount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}>
                        {invoiceStatusLabels[invoice.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="space-x-2">
                        <Link href={`/sales/invoices/${invoice.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        {invoice.status === "DRAFT" && (
                          <Link href={`/sales/invoices/edit/${invoice.id}`}>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createSupabaseServerClient();

  // Fetch data for the form
  const [customers, revenueAccounts, arAccounts] = await Promise.all([
    supabase.from("customers").select("*").order("name"),
    supabase.from("accounts").select("*").eq("type", "REVENUE").order("code"),
    supabase.from("accounts").select("*").eq("type", "ASSET").ilike("name", "%receivable%").order("code"),
  ]);

  // Check if we're creating a new invoice for a specific customer
  const customerId = searchParams?.customer as string;
  const isNewInvoice = searchParams?.new === "true" || !!customerId;

  if (isNewInvoice) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">New Invoice</h1>
            <p className="text-gray-600 mt-1">Create and send professional invoices</p>
          </div>
          <Link href="/sales/invoices">
            <Button variant="outline">Back to Invoices</Button>
          </Link>
        </div>

        <InvoiceForm
          customers={customers.data || []}
          revenueAccounts={revenueAccounts.data || []}
          arAccounts={arAccounts.data || []}
          initialData={customerId ? { customer_id: customerId } : undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage your sales invoices</p>
        </div>
        <Link href="/sales/invoices?new=true">
          <Button>New Invoice</Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading invoices...</div>}>
        <InvoiceList />
      </Suspense>
    </div>
  );
}
