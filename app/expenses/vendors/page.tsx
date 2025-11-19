import { createSupabaseServerClient } from "@/(common)/lib/supabase-server";
import { Button } from "@/(common)/components/ui";
import { Card, CardContent } from "@/(common)/components/ui";
import { hasOutstandingBills, calculateOutstandingAmount } from "../(common)/utils";
import { formatCurrency } from "@/accounting/(common)/utils";
import Link from "next/link";

export default async function VendorsPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch vendors with bill counts
  const { data: vendors } = await supabase
    .from("vendors")
    .select(`
      *,
      bills (
        id,
        status,
        total_amount
      )
    `)
    .order("name", { ascending: true });

  // Calculate additional vendor data
  const vendorsWithStats = vendors?.map(vendor => ({
    ...vendor,
    bill_count: vendor.bills?.length || 0,
    total_outstanding: calculateOutstandingAmount(vendor.bills || []),
    has_outstanding: hasOutstandingBills(vendor.bills || []),
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-gray-600 mt-1">Manage your vendor relationships</p>
        </div>
        <Button>New Vendor</Button> {/* Will implement vendor form modal in next iteration */}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{vendorsWithStats.length}</div>
            <div className="text-sm text-gray-500">Total Vendors</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {vendorsWithStats.filter(v => v.has_outstanding).length}
            </div>
            <div className="text-sm text-gray-500">With Outstanding Bills</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(
                vendorsWithStats.reduce((sum, v) => sum + (v.total_outstanding || 0), 0)
              )}
            </div>
            <div className="text-sm text-gray-500">Total Outstanding</div>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
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
                    Bills
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
                {vendorsWithStats.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {vendor.name}
                      </div>
                      {vendor.address && (
                        <div className="text-sm text-gray-500">{vendor.address}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vendor.bill_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {formatCurrency(vendor.total_outstanding || 0)}
                      </div>
                      {vendor.has_outstanding && (
                        <span className="text-xs text-orange-600">Outstanding</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="space-x-2">
                        <Link href={`/expenses/bills/new?vendor=${vendor.id}`}>
                          <Button variant="outline" size="sm">
                            New Bill
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
