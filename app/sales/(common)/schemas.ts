import { z } from "zod";

// --- Customer Schema ---
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

// --- Invoice Line Schema ---
export const invoiceLineSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  unit_price: z.coerce.number().min(0, "Unit price must be positive"),
  // This connects the line item to a specific Revenue Account (e.g., "Sales - Services")
  account_id: z.string().uuid("Revenue account required"),
});

export type InvoiceLineFormValues = z.infer<typeof invoiceLineSchema>;

// --- Invoice Schema ---
export const invoiceSchema = z
  .object({
    id: z.string().optional(),
    customer_id: z.string().uuid("Customer is required"),
    invoice_number: z.string().min(1, "Invoice number is required"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    due_date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid due date"),
    tax_rate: z.coerce.number().min(0).max(100).default(0),
    notes: z.string().optional(),
    lines: z.array(invoiceLineSchema).min(1, "Add at least one line item"),
  })
  .refine(
    (data) => {
      // Ensure due date is after or same as invoice date
      const invoiceDate = new Date(data.date);
      const dueDate = new Date(data.due_date);
      return dueDate >= invoiceDate;
    },
    {
      message: "Due date must be on or after invoice date",
      path: ["due_date"],
    },
  );

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

// --- Invoice Finalization Schema ---
export const finalizeInvoiceSchema = z.object({
  invoiceId: z.string().uuid("Invoice ID is required"),
  arAccountId: z.string().uuid("Accounts Receivable account is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
});

export type FinalizeInvoiceValues = z.infer<typeof finalizeInvoiceSchema>;

// --- Payment Schema ---
export const paymentSchema = z.object({
  invoice_id: z.string().uuid("Invoice is required"),
  account_id: z.string().uuid("Payment account is required"),
  amount: z.coerce.number().min(0.01, "Payment amount must be greater than 0"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  method: z
    .enum(["cash", "check", "bank_transfer", "credit_card", "other"])
    .default("bank_transfer"),
  reference: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
