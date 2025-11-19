import type { Customer, Invoice, InvoiceLine } from "./types";

/**
 * Calculate due date status for invoices
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
 * Format customer display name
 */
export function formatCustomerName(customer: Customer): string {
  return customer.name;
}

/**
 * Calculate total for a single invoice line
 */
export function calculateLineTotal(
  line: InvoiceLine | { quantity: number; unit_price: number },
): number {
  return (line.quantity || 0) * (line.unit_price || 0);
}

/**
 * Calculate invoice totals including subtotal and total
 */
export function calculateInvoiceTotals(
  lines: InvoiceLine[] | Array<{ quantity: number; unit_price: number }>,
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
 * Generate unique invoice number
 */
export function generateInvoiceNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `INV-${year}-${sequence.toString().padStart(4, "0")}`;
}

/**
 * Validate invoice line completeness
 */
export function validateInvoiceLine(line: Partial<InvoiceLine>): string[] {
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
    errors.push("Revenue account is required");
  }

  return errors;
}

/**
 * Check if customer has outstanding invoices
 */
export function hasOutstandingInvoices(invoices: Invoice[]): boolean {
  return invoices.some(
    (invoice) =>
      invoice.status === "SENT" ||
      invoice.status === "PARTIAL" ||
      invoice.status === "OVERDUE",
  );
}

/**
 * Calculate total outstanding amount for a customer
 */
export function calculateOutstandingAmount(invoices: Invoice[]): number {
  return invoices
    .filter(
      (invoice) =>
        invoice.status === "SENT" ||
        invoice.status === "PARTIAL" ||
        invoice.status === "OVERDUE",
    )
    .reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
}
