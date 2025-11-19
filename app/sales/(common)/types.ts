import type { Tables } from "@/common/types/supabase";

// Re-export Database tables with cleaner names for use within the feature
export type Customer = Tables<"customers">;
export type Invoice = Tables<"invoices">;
export type InvoiceLine = Tables<"invoice_lines">;

// Extended types for UI
export type CustomerWithInvoices = Customer & {
  invoice_count?: number;
  total_outstanding?: number;
};

export type InvoiceWithCustomerAndLines = Invoice & {
  customer?: Customer;
  lines?: InvoiceLine[];
  paid_amount?: number;
  outstanding_amount?: number;
};

// Invoice status helper
export const invoiceStatusLabels = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  PARTIAL: "Partial",
  OVERDUE: "Overdue",
  VOID: "Void",
} as const;

export const paymentMethodLabels = {
  cash: "Cash",
  check: "Check",
  bank_transfer: "Bank Transfer",
  credit_card: "Credit Card",
  other: "Other",
} as const;

// Utility functions
export function generateInvoiceNumber(orgId: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${timestamp}-${random}`;
}

export function calculateInvoiceTotals(
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

export function getInvoiceStatusColor(
  status: keyof typeof invoiceStatusLabels,
) {
  switch (status) {
    case "DRAFT":
      return { bg: "bg-gray-100", text: "text-gray-800" };
    case "SENT":
      return { bg: "bg-blue-100", text: "text-blue-800" };
    case "PAID":
      return { bg: "bg-green-100", text: "text-green-800" };
    case "PARTIAL":
      return { bg: "bg-yellow-100", text: "text-yellow-800" };
    case "OVERDUE":
      return { bg: "bg-red-100", text: "text-red-800" };
    case "VOID":
      return { bg: "bg-red-100", text: "text-red-800" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800" };
  }
}
