import { z } from "zod";

// Schema for a single row in the CSV
export const bankStatementRowSchema = z.object({
  date: z.string(), // parsed later
  amount: z.coerce.number(),
  description: z.string().optional(),
  reference: z.string().optional(),
});

export const uploadSchema = z.object({
  accountId: z.string().uuid("Bank account is required"),
  csvContent: z.string(), // Passing file content as string for server action
});

export const matchSchema = z.object({
  bankTransactionId: z.string().uuid("Bank transaction is required"),
  journalEntryId: z.string().uuid("Journal entry is required"),
});

export const quickCreateSchema = z.object({
  bankTransactionId: z.string().uuid("Bank transaction is required"),
  accountId: z.string().uuid("Category account is required"), // The expense/income account to categorize to
  description: z.string().min(1, "Description is required"),
});

export type UploadFormValues = z.infer<typeof uploadSchema>;
export type MatchFormValues = z.infer<typeof matchSchema>;
export type QuickCreateFormValues = z.infer<typeof quickCreateSchema>;
