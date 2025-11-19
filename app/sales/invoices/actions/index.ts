"use server";

import { authActionClient } from "@/(common)/lib/safe-action";
import { invoiceSchema, finalizeInvoiceSchema } from "../../(common)/schemas";
import { revalidatePath } from "next/cache";
import { generateInvoiceNumber } from "../../(common)/utils";
import { z } from "zod";

// Action 1: Save Draft (Standard DB Insert)
export const saveInvoiceDraft = authActionClient
  .schema(invoiceSchema)
  .action(async ({ parsedInput: data, ctx: { supabase, authUser } }) => {
    // Get user's organization
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", authUser.id)
      .single();

    if (!orgMember) throw new Error("Organization not found");

    // Calculate total server-side for security
    const totalAmount = data.lines.reduce(
      (sum, line) => sum + line.quantity * line.unit_price,
      0,
    );

    // 1. Upsert Invoice Header
    const { data: invoice, error: invError } = await supabase
      .from("invoices")
      .upsert({
        ...(data.id ? { id: data.id } : {}),
        organization_id: orgMember.organization_id,
        customer_id: data.customer_id,
        invoice_number:
          data.invoice_number || generateInvoiceNumber(Date.now()),
        date: data.date,
        due_date: data.due_date,
        status: "DRAFT",
        total_amount: totalAmount,
        notes: data.notes || null,
      })
      .select()
      .single();

    if (invError) throw new Error(invError.message);

    // 2. Delete existing lines if updating, then re-insert
    if (data.id) {
      await supabase.from("invoice_lines").delete().eq("invoice_id", data.id);
    }

    const linesToInsert = data.lines.map((line) => ({
      invoice_id: invoice.id,
      description: line.description,
      quantity: line.quantity,
      unit_price: line.unit_price,
      account_id: line.account_id,
    }));

    const { error: lineError } = await supabase
      .from("invoice_lines")
      .insert(linesToInsert);
    if (lineError) throw new Error(lineError.message);

    revalidatePath("/sales/invoices");
    return { success: true, invoiceId: invoice.id };
  });

// Action 2: Finalize (Call RPC)
export const finalizeInvoice = authActionClient
  .schema(finalizeInvoiceSchema)
  .action(
    async ({
      parsedInput: { invoiceId, arAccountId, date },
      ctx: { supabase },
    }) => {
      const { error } = await supabase.rpc("approve_invoice", {
        p_invoice_id: invoiceId,
        p_ar_account_id: arAccountId,
        p_date: date,
      });

      if (error) throw new Error(error.message);

      revalidatePath("/sales/invoices");
      return { success: true };
    },
  );

export const deleteInvoice = authActionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput: data, ctx: { supabase, authUser } }) => {
    // Get user's organization
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", authUser.id)
      .single();

    if (!orgMember) throw new Error("Organization not found");

    // Check invoice status
    const { data: invoice } = await supabase
      .from("invoices")
      .select("status")
      .eq("id", data.id)
      .single();

    if (!invoice) throw new Error("Invoice not found");

    if (invoice.status !== "DRAFT") {
      throw new Error("Can only delete draft invoices");
    }

    // Delete invoice (cascade will delete lines)
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", data.id);

    if (error) throw new Error(error.message);

    revalidatePath("/sales/invoices");
    return { success: true };
  });

// Generate next invoice number
export const generateNextInvoiceNumber = authActionClient
  .schema(z.object({}))
  .action(async ({ ctx: { supabase, authUser } }) => {
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", authUser.id)
      .single();

    if (!orgMember) throw new Error("Organization not found");

    // Get latest invoice number for this org
    const { data: lastInvoice } = await supabase
      .from("invoices")
      .select("invoice_number")
      .eq("organization_id", orgMember.organization_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let nextNumber = generateInvoiceNumber(1);

    if (lastInvoice?.invoice_number) {
      // Extract sequence from last invoice number (INV-2024-0001 format)
      const match = lastInvoice.invoice_number.match(/INV-(\d{4})-(\d{4})$/);
      if (match) {
        const year = parseInt(match[1]);
        const sequence = parseInt(match[2]);
        const currentYear = new Date().getFullYear();

        if (year === currentYear) {
          nextNumber = generateInvoiceNumber(sequence + 1);
        } else {
          nextNumber = generateInvoiceNumber(1);
        }
      }
    }

    return { invoiceNumber: nextNumber };
  });
