import { z } from "zod";
import { AccountType, JournalStatus, InvoiceStatus, BillStatus } from "./types";

// --- Chart of Accounts Schemas ---
export const accountSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, "Code is required").max(20),
  name: z.string().min(1, "Name is required").max(100),
  type: z.nativeEnum(AccountType),
  parent_account_id: z.string().uuid().optional().nullable(),
  description: z.string().optional(),
});

export type AccountFormValues = z.infer<typeof accountSchema>;

// --- Journal Entry Schemas ---
export const journalLineSchema = z.object({
  account_id: z.string().uuid("Account is required"),
  description: z.string().optional(),
  debit: z.coerce.number().min(0).default(0),
  credit: z.coerce.number().min(0).default(0),
});

export const journalEntrySchema = z
  .object({
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    description: z.string().min(1, "Description is required"),
    status: z.nativeEnum(JournalStatus).default(JournalStatus.POSTED),
    lines: z.array(journalLineSchema).min(2, "At least 2 lines required"),
  })
  .refine(
    (data) => {
      // Client-side Balance Check
      const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = data.lines.reduce(
        (sum, line) => sum + line.credit,
        0,
      );
      return Math.abs(totalDebit - totalCredit) < 0.01; // Float tolerance
    },
    {
      message: "Debits must equal Credits",
      path: ["lines"], // Attach error to the lines array
    },
  );

export type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;

// --- Customer Schemas ---
export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z
    .string()
    .length(3, "Must be 3-character currency code")
    .default("USD"),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

// --- Vendor Schemas ---
export const vendorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;

// --- Invoice Schemas ---
export const invoiceLineSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(0, "Quantity must be positive"),
  unit_price: z.coerce.number().min(0, "Unit price must be positive"),
  account_id: z.string().uuid("Revenue account is required"),
});

export const invoiceSchema = z.object({
  id: z.string().optional(),
  customer_id: z.string().uuid("Customer is required"),
  invoice_number: z.string().min(1, "Invoice number is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  due_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid due date"),
  status: z.nativeEnum(InvoiceStatus).default(InvoiceStatus.DRAFT),
  notes: z.string().optional(),
  lines: z.array(invoiceLineSchema).min(1, "At least 1 line item required"),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

// --- Bill Schemas ---
export const billLineSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(0, "Quantity must be positive"),
  unit_price: z.coerce.number().min(0, "Unit price must be positive"),
  account_id: z.string().uuid("Expense account is required"),
});

export const billSchema = z.object({
  id: z.string().optional(),
  vendor_id: z.string().uuid("Vendor is required"),
  bill_number: z.string().min(1, "Bill number is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  due_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid due date"),
  status: z.nativeEnum(BillStatus).default(BillStatus.OPEN),
  lines: z.array(billLineSchema).min(1, "At least 1 line item required"),
});

export type BillFormValues = z.infer<typeof billSchema>;
