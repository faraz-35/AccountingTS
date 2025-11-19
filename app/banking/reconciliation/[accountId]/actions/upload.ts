"use server";

import { authActionClient } from "@/(common)/lib/safe-action";
import { uploadSchema } from "../../../(common)/schemas";
import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { parseCSVDate } from "../../../(common)/types";
import { z } from "zod";

export const uploadBankStatement = authActionClient
  .schema(uploadSchema)
  .action(
    async ({
      parsedInput: { accountId, csvContent },
      ctx: { supabase, authUser },
    }) => {
      // 1. Get Org ID
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", authUser.id)
        .single();

      if (!orgMember) throw new Error("Organization not found");

      // 2. Parse CSV
      const { data: rows, errors } = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
      });

      if (errors.length > 0) {
        throw new Error(`CSV Parse Error: ${errors[0].message}`);
      }

      if (!rows || rows.length === 0) {
        throw new Error("CSV file is empty or could not be parsed");
      }

      // 3. Transform & Prepare Insert
      // Try to detect common CSV headers and map them
      const transactions = rows.map((row: any, index) => {
        // Find date column (common headers: Date, Transaction Date, Date)
        const dateField =
          row.Date || row["Transaction Date"] || row["Date"] || row.date;
        // Find amount column (common headers: Amount, Debit, Credit, Transaction Amount)
        let amountField = row.Amount || row["Transaction Amount"] || row.amount;
        const descriptionField =
          row.Description ||
          row.description ||
          row["Description"] ||
          row.Memo ||
          row.memo;
        const referenceField =
          row.Reference ||
          row.reference ||
          row["Reference"] ||
          row["Transaction ID"] ||
          row["Transaction ID"];

        // Clean amount field (remove commas, currency symbols, etc.)
        if (typeof amountField === "string") {
          amountField = amountField.replace(/[$,]/g, "");
        }

        const amount = parseFloat(amountField);
        if (isNaN(amount)) {
          throw new Error(`Invalid amount in row ${index + 1}: ${amountField}`);
        }

        return {
          organization_id: orgMember.organization_id,
          account_id: accountId,
          date: dateField
            ? parseCSVDate(dateField)
            : new Date().toISOString().split("T")[0],
          amount: amount,
          description: descriptionField || "Imported Transaction",
          external_id: referenceField || null,
          status: "UNMATCHED",
        };
      });

      // 4. Bulk Insert
      const { error } = await supabase
        .from("bank_transactions")
        .insert(transactions);

      if (error) throw new Error(error.message);

      revalidatePath("/banking/reconciliation");
      return { success: true, count: transactions.length };
    },
  );

export const deleteBankTransaction = authActionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput: { id }, ctx: { supabase, authUser } }) => {
    // Get user's organization
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", authUser.id)
      .single();

    if (!orgMember) throw new Error("Organization not found");

    // Verify ownership
    const { data: bankTx } = await supabase
      .from("bank_transactions")
      .select("status")
      .eq("id", id)
      .eq("organization_id", orgMember.organization_id)
      .single();

    if (!bankTx) throw new Error("Bank transaction not found or access denied");

    if (bankTx.status === "MATCHED") {
      throw new Error("Cannot delete matched transaction");
    }

    const { error } = await supabase
      .from("bank_transactions")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/banking/reconciliation");
    return { success: true };
  });
