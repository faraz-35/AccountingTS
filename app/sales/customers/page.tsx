import { createSupabaseServerClient } from "@/common/lib/supabase-server";
import { Button } from "@/common/components/ui";
import { Card, CardContent } from "@/common/components/ui";
import {
  hasOutstandingInvoices,
  calculateOutstandingAmount,
} from "../(common)/utils";
import { formatCurrency } from "@/accounting/(common)/utils";
import Link from "next/link";
import { CustomerDialog } from "./components/customer-dialog";

export default async function CustomersPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch customers with invoice counts
  const { data: customers } = await supabase
    .from("customers")
    .select(
      `
      *,
      invoices (
        id,
        status,
        total_amount
      )
    `,
    )
    .order("name", { ascending: true });

  // Calculate additional customer data
  const customersWithStats =
    customers?.map((customer) => ({
      ...customer,
      invoice_count: customer.invoices?.length || 0,
      total_outstanding: calculateOutstandingAmount(customer.invoices || []),
      has_outstanding: hasOutstandingInvoices(customer.invoices || []),
    })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <CustomerDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {customersWithStats.length}
            </div>
            <div className="text-sm text-gray-500">Total Customers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {customersWithStats.filter((c) => c.has_outstanding).length}
            </div>
            <div className="text-sm text-gray-500">
              With Outstanding Invoices
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(
                customersWithStats.reduce(
                  (sum, c) => sum + (c.total_outstanding || 0),
                  0,
                ),
              )}
            </div>
            <div className="text-sm text-gray-500">Total Outstanding</div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoices
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outstanding
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customersWithStats.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.name}
                      </div>
                      {customer.address && (
                        <div className="text-sm text-gray-500">
                          {customer.address}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.invoice_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {formatCurrency(customer.total_outstanding || 0)}
                      </div>
                      {customer.has_outstanding && (
                        <span className="text-xs text-red-600">
                          Outstanding
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="space-x-2">
                        <Link
                          href={`/sales/invoices/new?customer=${customer.id}`}
                        >
                          <Button variant="outline" size="sm">
                            New Invoice
                          </Button>
                        </Link>
                        {/* Edit and Delete buttons will be added in next iteration */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
