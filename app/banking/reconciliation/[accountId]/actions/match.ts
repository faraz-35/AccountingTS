"use server";

import { authActionClient } from "@/(common)/lib/safe-action";
import { matchSchema, quickCreateSchema } from "../../../(common)/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Action 1: Match existing Journal Entry
export const matchTransaction = authActionClient
  .schema(matchSchema)
  .action(
    async ({
      parsedInput: { bankTransactionId, journalEntryId },
      ctx: { supabase },
    }) => {
      // Update the bank transaction status and link
      const { error } = await supabase
        .from("bank_transactions")
        .update({
          status: "MATCHED",
          matched_journal_entry_id: journalEntryId,
        })
        .eq("id", bankTransactionId);

      if (error) throw new Error(error.message);

      revalidatePath("/banking/reconciliation");
      return { success: true };
    },
  );

// Action 2: Quick Create (e.g., Bank Fee)
export const createAndMatchTransaction = authActionClient
  .schema(quickCreateSchema)
  .action(
    async ({
      parsedInput: { bankTransactionId, accountId, description },
      ctx: { supabase },
    }) => {
      // 1. Fetch Bank Transaction details
      const { data: bankTx } = await supabase
        .from("bank_transactions")
        .select("*")
        .eq("id", bankTransactionId)
        .single();

      if (!bankTx) throw new Error("Transaction not found");

      // 2. Prepare Journal Entry Lines
      // If amount < 0 (Withdrawal): Credit Bank, Debit Expense
      // If amount > 0 (Deposit): Debit Bank, Credit Income
      const isWithdrawal = bankTx.amount < 0;
      const absAmount = Math.abs(bankTx.amount);

      const lines = [
        // Line 1: The Bank Account impact
        {
          account_id: bankTx.account_id,
          description: "Bank Impact",
          debit: isWithdrawal ? 0 : absAmount,
          credit: isWithdrawal ? absAmount : 0,
        },
        // Line 2: The Category (Expense/Income)
        {
          account_id: accountId,
          description: description,
          debit: isWithdrawal ? absAmount : 0,
          credit: isWithdrawal ? 0 : absAmount,
        },
      ];

      // 3. Create Journal Entry via RPC
      const { data: journalId, error: rpcError } = await supabase.rpc(
        "post_journal_entry",
        {
          p_date: bankTx.date,
          p_description: description,
          p_reference_type: "BANK_TX",
          p_reference_id: bankTx.id,
          p_status: "POSTED",
          p_lines: lines,
        },
      );

      if (rpcError) throw new Error(rpcError.message);

      // 4. Match it
      await supabase
        .from("bank_transactions")
        .update({ status: "MATCHED", matched_journal_entry_id: journalId })
        .eq("id", bankTransactionId);

      revalidatePath("/banking/reconciliation");
      return { success: true };
    },
  );

// Fetch potential matches for a bank transaction
export const findPotentialMatches = authActionClient
  .schema(z.object({ bankTransactionId: z.string().uuid() }))
  .action(async ({ parsedInput: { bankTransactionId }, ctx: { supabase } }) => {
    // Get the bank transaction
    const { data: bankTx } = await supabase
      .from("bank_transactions")
      .select("*")
      .eq("id", bankTransactionId)
      .single();

    if (!bankTx) throw new Error("Bank transaction not found");

    // Get recent journal entries (within 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: journalEntries } = await supabase
      .from("journal_entries")
      .select(
        `
        id,
        date,
        description,
        journal_entry_lines (
          account_id,
          debit,
          credit
        )
      `,
      )
      .gte("date", sevenDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: false })
      .limit(50);

    // Find entries that involve the same bank account
    const candidates = journalEntries
      ?.filter((entry) => {
        return entry.journal_entry_lines.some(
          (line) => line.account_id === bankTx.account_id,
        );
      })
      .filter((entry) => {
        // Check if amounts match (allow for rounding)
        const entryTotal = entry.journal_entry_lines.reduce(
          (sum, line) => sum + line.debit - line.credit,
          0,
        );
        return Math.abs(entryTotal - bankTx.amount) < 0.01;
      });

    return { success: true, candidates };
  });
