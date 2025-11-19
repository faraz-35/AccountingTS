"use server";

import { z } from "zod";
import { authAction } from "@/(common)/lib/safe-action";
import { customerSchema } from "../../(common)/schemas";
import { revalidatePath } from "next/cache";

export const upsertCustomer = authAction(
  customerSchema,
  async (data, { supabase, authUser }) => {
    // Get user's organization
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", authUser.id)
      .single();

    if (!orgMember) throw new Error("Organization not found");

    const { error } = await supabase.from("customers").upsert({
      ...(data.id ? { id: data.id } : {}),
      organization_id: orgMember.organization_id,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      currency: data.currency,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/sales/customers");
    return { success: true };
  },
);

export const deleteCustomer = authAction(
  z.object({ id: z.string().uuid() }),
  async (data, { supabase, authUser }) => {
    // Get user's organization
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", authUser.id)
      .single();

    if (!orgMember) throw new Error("Organization not found");

    // Check if customer has invoices
    const { data: invoices } = await supabase
      .from("invoices")
      .select("id")
      .eq("customer_id", data.id)
      .limit(1);

    if (invoices && invoices.length > 0) {
      throw new Error("Cannot delete customer with existing invoices");
    }

    // Delete customer
    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", data.id);

    if (error) throw new Error(error.message);

    revalidatePath("/sales/customers");
    return { success: true };
  },
);
