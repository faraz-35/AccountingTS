import type { Tables } from "@/common/types/supabase";

// Re-export Database tables with cleaner names for use within the feature
export type Account = Tables<"accounts">;
export type JournalEntry = Tables<"journal_entries">;
export type JournalEntryLine = Tables<"journal_entry_lines">;
export type Invoice = Tables<"invoices">;
export type InvoiceLine = Tables<"invoice_lines">;
export type Customer = Tables<"customers">;
export type Vendor = Tables<"vendors">;
export type Bill = Tables<"bills">;

// Enum mappings (matching DB enums)
export enum AccountType {
  ASSET = "ASSET",
  LIABILITY = "LIABILITY",
  EQUITY = "EQUITY",
  REVENUE = "REVENUE",
  EXPENSE = "EXPENSE",
}

export enum JournalStatus {
  DRAFT = "DRAFT",
  POSTED = "POSTED",
  ARCHIVED = "ARCHIVED",
}

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PAID = "PAID",
  PARTIAL = "PARTIAL",
  OVERDUE = "OVERDUE",
  VOID = "VOID",
}

export enum BillStatus {
  OPEN = "OPEN",
  PAID = "PAID",
  PARTIAL = "PARTIAL",
  OVERDUE = "OVERDUE",
  VOID = "VOID",
}

// Extended types for UI forms
export type AccountWithBalance = Account & {
  // Computed balance can be added here if needed
};

export type JournalEntryWithLines = JournalEntry & {
  lines?: JournalEntryLine[];
};

export type InvoiceWithCustomer = Invoice & {
  customer?: Customer;
  lines?: InvoiceLine[];
};

export type BillWithVendor = Bill & {
  vendor?: Vendor;
};

// Form types for creating/updating
export type CreateAccountInput = Omit<
  Account,
  "id" | "created_at" | "updated_at" | "current_balance"
>;

export type CreateJournalEntryInput = Omit<
  JournalEntry,
  "id" | "created_at" | "updated_at" | "entry_number"
> & {
  lines: Omit<JournalEntryLine, "id" | "journal_entry_id" | "created_at">[];
};

export type CreateCustomerInput = Omit<
  Customer,
  "id" | "created_at" | "updated_at"
>;

export type CreateVendorInput = Omit<
  Vendor,
  "id" | "created_at" | "updated_at"
>;

export type CreateInvoiceInput = Omit<
  Invoice,
  "id" | "created_at" | "updated_at" | "total_amount"
> & {
  lines: Omit<InvoiceLine, "id" | "invoice_id" | "created_at" | "amount">[];
};
