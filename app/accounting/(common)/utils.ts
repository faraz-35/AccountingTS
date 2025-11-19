import type { Account, JournalEntry, Invoice } from "./types";

// Accounting utilities and formatters

/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format account type for display
 */
export function formatAccountType(type: Account["type"]): string {
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

/**
 * Get account type color classes for UI
 */
export function getAccountTypeColor(type: Account["type"]): {
  bg: string;
  text: string;
} {
  switch (type) {
    case "ASSET":
      return { bg: "bg-blue-100", text: "text-blue-800" };
    case "LIABILITY":
      return { bg: "bg-red-100", text: "text-red-800" };
    case "EQUITY":
      return { bg: "bg-green-100", text: "text-green-800" };
    case "REVENUE":
      return { bg: "bg-emerald-100", text: "text-emerald-800" };
    case "EXPENSE":
      return { bg: "bg-orange-100", text: "text-orange-800" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800" };
  }
}

/**
 * Generate journal entry reference number
 */
export function generateJournalEntryNumber(entryNumber: number): string {
  return `JE-${entryNumber.toString().padStart(6, "0")}`;
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(year: number, sequence: number): string {
  return `INV-${year}-${sequence.toString().padStart(4, "0")}`;
}

/**
 * Generate bill number
 */
export function generateBillNumber(year: number, sequence: number): string {
  return `BILL-${year}-${sequence.toString().padStart(4, "0")}`;
}

/**
 * Calculate if journal entry is balanced (debits = credits)
 */
export function isJournalEntryBalanced(
  lines: Array<{ debit: number; credit: number }>,
): boolean {
  const totalDebits = lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredits = lines.reduce((sum, line) => sum + line.credit, 0);
  return Math.abs(totalDebits - totalCredits) < 0.01; // Allow for floating point precision
}

/**
 * Calculate the difference between debits and credits
 */
export function getJournalEntryBalance(
  lines: Array<{ debit: number; credit: number }>,
): {
  totalDebits: number;
  totalCredits: number;
  difference: number;
  isBalanced: boolean;
} {
  const totalDebits = lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredits = lines.reduce((sum, line) => sum + line.credit, 0);
  const difference = totalDebits - totalCredits;

  return {
    totalDebits,
    totalCredits,
    difference,
    isBalanced: Math.abs(difference) < 0.01,
  };
}

/**
 * Format date for accounting displays
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Get status badge classes for different entity statuses
 */
export function getStatusBadgeClasses(status: string): {
  bg: string;
  text: string;
} {
  switch (status) {
    case "DRAFT":
      return { bg: "bg-gray-100", text: "text-gray-800" };
    case "POSTED":
      return { bg: "bg-green-100", text: "text-green-800" };
    case "PAID":
      return { bg: "bg-emerald-100", text: "text-emerald-800" };
    case "SENT":
      return { bg: "bg-blue-100", text: "text-blue-800" };
    case "OPEN":
      return { bg: "bg-yellow-100", text: "text-yellow-800" };
    case "OVERDUE":
      return { bg: "bg-red-100", text: "text-red-800" };
    case "VOID":
      return { bg: "bg-red-100", text: "text-red-800" };
    case "ARCHIVED":
      return { bg: "bg-gray-100", text: "text-gray-800" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800" };
  }
}

/**
 * Calculate due date status
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
