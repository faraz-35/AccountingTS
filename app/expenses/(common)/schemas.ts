import { z } from "zod";

// --- Vendor Schema ---
export const vendorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type VendorFormValues = z.infer<typeof vendorSchema>;

// --- Bill Line Schema ---
export const billLineSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description required"),
  quantity: z.coerce.number().default(1),
  unit_price: z.coerce.number().min(0, "Unit price must be positive"),
  // Connects to Expense or Asset Account
  account_id: z.string().uuid("Expense account required"),
});

export type BillLineFormValues = z.infer<typeof billLineSchema>;

// --- Bill Schema ---
export const billSchema = z
  .object({
    id: z.string().optional(),
    vendor_id: z.string().uuid("Vendor is required"),
    bill_number: z.string().min(1, "Bill # required"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    due_date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid due date"),
    lines: z.array(billLineSchema).min(1, "At least one line required"),
  })
  .refine(
    (data) => {
      // Ensure due date is after or same as bill date
      const billDate = new Date(data.date);
      const dueDate = new Date(data.due_date);
      return dueDate >= billDate;
    },
    {
      message: "Due date must be on or after bill date",
      path: ["due_date"],
    },
  );

export type BillFormValues = z.infer<typeof billSchema>;

// --- Bill Approval Schema ---
export const approveBillSchema = z.object({
  billId: z.string().uuid("Bill ID is required"),
  apAccountId: z.string().uuid("Accounts Payable account is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
});

export type ApproveBillValues = z.infer<typeof approveBillSchema>;

// --- Payment Schema ---
export const payBillSchema = z.object({
  billId: z.string().uuid("Bill is required"),
  paymentAccountId: z.string().uuid("Payment account is required"),
  amount: z.coerce.number().min(0.01, "Payment amount must be greater than 0"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  reference: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof payBillSchema>;
