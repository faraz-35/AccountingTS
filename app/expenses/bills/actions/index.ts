"use server";

import { authActionClient } from "@/common/lib/safe-action";
import {
  billSchema,
  approveBillSchema,
  payBillSchema,
} from "../../(common)/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generateBillNumber } from "../../(common)/utils";

// 1. Save Draft
export const saveBillDraft = authActionClient
  .schema(billSchema)
  .action(async ({ parsedInput: data, ctx: { supabase, authUser } }) => {
    // Get user's organization
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", authUser.id)
      .single();

    if (!orgMember) throw new Error("Organization not found");

    // Upsert Header
    const { data: bill, error: billError } = await supabase
      .from("bills")
      .upsert({
        ...(data.id ? { id: data.id } : {}),
        organization_id: orgMember.organization_id,
        vendor_id: data.vendor_id,
        bill_number: data.bill_number || generateBillNumber(Date.now()),
        date: data.date,
        due_date: data.due_date,
        status: "DRAFT", // Reset to draft on edit
        total_amount: data.lines.reduce(
          (sum, l) => sum + l.quantity * l.unit_price,
          0,
        ),
      })
      .select()
      .single();

    if (billError) throw new Error(billError.message);

    // Upsert Lines (Delete/Insert strategy)
    if (data.id) {
      await supabase.from("bill_lines").delete().eq("bill_id", data.id);
    }

    const lines = data.lines.map((l) => ({
      bill_id: bill.id,
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unit_price,
      account_id: l.account_id,
    }));

    const { error: lineError } = await supabase
      .from("bill_lines")
      .insert(lines);
    if (lineError) throw new Error(lineError.message);

    revalidatePath("/expenses/bills");
    return { success: true, billId: bill.id };
  });

// 2. Approve (Post to GL)
export const approveBill = authActionClient
  .schema(approveBillSchema)
  .action(
    async ({
      parsedInput: { billId, apAccountId, date },
      ctx: { supabase },
    }) => {
      const { error } = await supabase.rpc("approve_bill", {
        p_bill_id: billId,
        p_ap_account_id: apAccountId,
        p_date: date,
      });
      if (error) throw new Error(error.message);
      revalidatePath("/expenses/bills");
      return { success: true };
    },
  );

// 3. Pay Bill
export const recordBillPayment = authActionClient
  .schema(payBillSchema)
  .action(async ({ parsedInput: data, ctx: { supabase } }) => {
    const { error } = await supabase.rpc("pay_bill", {
      p_bill_id: data.billId,
      p_payment_account_id: data.paymentAccountId,
      p_amount: data.amount,
      p_date: data.date,
      p_ref_number: data.reference || "",
    });

    if (error) throw new Error(error.message);
    revalidatePath("/expenses/bills");
    return { success: true };
  });

export const deleteBill = authActionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput: data, ctx: { supabase, authUser } }) => {
    // Get user's organization
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", authUser.id)
      .single();

    if (!orgMember) throw new Error("Organization not found");

    // Check bill status
    const { data: bill } = await supabase
      .from("bills")
      .select("status")
      .eq("id", data.id)
      .single();

    if (!bill) throw new Error("Bill not found");

    if (bill.status !== "DRAFT") {
      throw new Error("Can only delete draft bills");
    }

    // Delete bill (cascade will delete lines)
    const { error } = await supabase.from("bills").delete().eq("id", data.id);

    if (error) throw new Error(error.message);

    revalidatePath("/expenses/bills");
    return { success: true };
  });

// Generate next bill number
export const generateNextBillNumber = authActionClient
  .schema(z.object({}))
  .action(async ({ ctx: { supabase, authUser } }) => {
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", authUser.id)
      .single();

    if (!orgMember) throw new Error("Organization not found");

    // Get latest bill number for this org
    const { data: lastBill } = await supabase
      .from("bills")
      .select("bill_number")
      .eq("organization_id", orgMember.organization_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let nextNumber = generateBillNumber(1);

    if (lastBill?.bill_number) {
      // Extract sequence from last bill number (BILL-2024-0001 format)
      const match = lastBill.bill_number.match(/BILL-(\d{4})-(\d{4})$/);
      if (match) {
        const year = parseInt(match[1]);
        const sequence = parseInt(match[2]);
        const currentYear = new Date().getFullYear();

        if (year === currentYear) {
          nextNumber = generateBillNumber(sequence + 1);
        } else {
          nextNumber = generateBillNumber(1);
        }
      }
    }

    return { billNumber: nextNumber };
  });
