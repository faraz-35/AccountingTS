import type { Vendor, Bill, BillLine } from "./types";

/**
 * Calculate due date status for bills
 */
export function getDueDateStatus(dueDate: string | Date): {
  status: "overdue" | "due-soon" | "normal";
  daysUntilDue: number;
} {
  const now = new Date();
  const due = new Date(dueDate);
  const daysUntilDue = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilDue < 0) {
    return { status: "overdue", daysUntilDue };
  } else if (daysUntilDue <= 7) {
    return { status: "due-soon", daysUntilDue };
  } else {
    return { status: "normal", daysUntilDue };
  }
}

/**
 * Format vendor display name
 */
export function formatVendorName(vendor: Vendor): string {
  return vendor.name;
}

/**
 * Calculate total for a single bill line
 */
export function calculateLineTotal(
  line: BillLine | { quantity: number; unit_price: number },
): number {
  return (line.quantity || 0) * (line.unit_price || 0);
}

/**
 * Calculate bill totals including subtotal and total
 */
export function calculateBillTotals(
  lines: BillLine[] | Array<{ quantity: number; unit_price: number }>,
) {
  const subtotal = lines.reduce(
    (sum, line) => sum + calculateLineTotal(line),
    0,
  );

  return {
    subtotal,
    tax: 0, // Will implement tax in future version
    total: subtotal,
    lineCount: lines.length,
  };
}

/**
 * Generate unique bill number
 */
export function generateBillNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `BILL-${year}-${sequence.toString().padStart(4, "0")}`;
}

/**
 * Validate bill line completeness
 */
export function validateBillLine(line: Partial<BillLine>): string[] {
  const errors: string[] = [];

  if (!line.description?.trim()) {
    errors.push("Description is required");
  }
  if (!line.quantity || line.quantity <= 0) {
    errors.push("Quantity must be greater than 0");
  }
  if (!line.unit_price || line.unit_price < 0) {
    errors.push("Unit price must be 0 or greater");
  }
  if (!line.account_id) {
    errors.push("Expense/Asset account is required");
  }

  return errors;
}

/**
 * Check if vendor has outstanding bills
 */
export function hasOutstandingBills(bills: Bill[]): boolean {
  return bills.some(
    (bill) =>
      bill.status === "OPEN" ||
      bill.status === "PARTIAL" ||
      bill.status === "OVERDUE",
  );
}

/**
 * Calculate total outstanding amount for a vendor
 */
export function calculateOutstandingAmount(bills: Bill[]): number {
  return bills
    .filter(
      (bill) =>
        bill.status === "OPEN" ||
        bill.status === "PARTIAL" ||
        bill.status === "OVERDUE",
    )
    .reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
}
