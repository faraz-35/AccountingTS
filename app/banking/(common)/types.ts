import type { Tables } from "@/common/types/supabase";

// Re-export Database tables with cleaner names for use within the feature
export type BankTransaction = Tables<"bank_transactions">;

// Extended types for UI
export type BankTransactionWithAccount = BankTransaction & {
  account?: {
    id: string;
    name: string;
    type: string;
  };
  matched_journal_entry?: {
    id: string;
    date: string;
    description: string;
  };
};

// Reconciliation status helper
export const reconciliationStatusLabels = {
  UNMATCHED: "Unmatched",
  MATCHED: "Matched",
  EXCLUDED: "Excluded",
} as const;

// Utility functions
export function formatBankAmount(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

  // Add visual indicator for positive/negative
  if (amount > 0) {
    return `+${formatted}`;
  } else if (amount < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

export function getBankTransactionColor(amount: number): {
  text: string;
  bg: string;
} {
  if (amount > 0) {
    return { text: "text-green-600", bg: "bg-green-50" };
  } else if (amount < 0) {
    return { text: "text-red-600", bg: "bg-red-50" };
  }
  return { text: "text-gray-600", bg: "bg-gray-50" };
}

export function parseCSVDate(dateString: string): string {
  // Try common date formats
  const formats = [
    "MM/DD/YYYY",
    "M/D/YYYY",
    "MM-DD-YYYY",
    "YYYY-MM-DD",
    "DD/MM/YYYY",
    "D/M/YYYY",
  ];

  for (const format of formats) {
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    } catch {
      continue;
    }
  }

  // Fallback: return as-is (will be validated on the server)
  return dateString;
}

// Candidate matching logic
export function findMatchingCandidates(
  bankTx: BankTransaction,
  journalEntries: any[],
): any[] {
  if (!journalEntries.length) return [];

  return journalEntries
    .filter((entry) => {
      const amountMatches = Math.abs(entry.amount - bankTx.amount) < 0.01; // Allow for small rounding differences
      const dateMatches =
        Math.abs(
          new Date(entry.date).getTime() - new Date(bankTx.date).getTime(),
        ) <=
        3 * 24 * 60 * 60 * 1000; // Within 3 days

      return amountMatches && dateMatches;
    })
    .sort((a, b) => {
      // Sort by recency (newer first)
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
}
