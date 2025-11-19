import type { Tables } from "@/(common)/types/supabase";

// Re-export Database tables with cleaner names for use within the feature
export type Vendor = Tables<"vendors">;
export type Bill = Tables<"bills">;
export type BillLine = Tables<"bill_lines">;

// Extended types for UI
export type VendorWithBills = Vendor & {
  bill_count?: number;
  total_outstanding?: number;
};

export type BillWithVendorAndLines = Bill & {
  vendor?: Vendor;
  lines?: BillLine[];
  paid_amount?: number;
  outstanding_amount?: number;
};

// Bill status helper
export const billStatusLabels = {
  OPEN: "Open",
  PAID: "Paid",
  PARTIAL: "Partial",
  OVERDUE: "Overdue",
  VOID: "Void",
  DRAFT: "Draft",
} as const;

// Utility functions
export function generateBillNumber(orgId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BILL-${timestamp}-${random}`;
}

export function calculateBillTotals(
  lines: Array<{ quantity: number; unit_price: number }>,
) {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.quantity * line.unit_price,
    0,
  );
  return {
    subtotal,
    tax: 0, // Will implement tax calculation in future version
    total: subtotal,
  };
}

export function getBillStatusColor(status: keyof typeof billStatusLabels) {
  switch (status) {
    case "DRAFT":
      return { bg: "bg-gray-100", text: "text-gray-800" };
    case "OPEN":
      return { bg: "bg-yellow-100", text: "text-yellow-800" };
    case "PAID":
      return { bg: "bg-green-100", text: "text-green-800" };
    case "PARTIAL":
      return { bg: "bg-orange-100", text: "text-orange-800" };
    case "OVERDUE":
      return { bg: "bg-red-100", text: "text-red-800" };
    case "VOID":
      return { bg: "bg-red-100", text: "text-red-800" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800" };
  }
}
