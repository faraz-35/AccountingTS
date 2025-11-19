"use server";

import { authActionClient } from "@/(common)/lib/safe-action";
import { vendorSchema } from "../../(common)/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const upsertVendor = authActionClient(
  vendorSchema,
  async (data, { supabase, authUser }) => {
    // Get user's organization
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", authUser.id)
      .single();

    if (!orgMember) throw new Error("Organization not found");

    const { error } = await supabase.from("vendors").upsert({
      ...(data.id ? { id: data.id } : {}),
      organization_id: orgMember.organization_id,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/expenses/vendors");
    return { success: true };
  },
);

export const deleteVendor = authActionClient(
  z.object({ id: z.string().uuid() }),
  async (data, { supabase, authUser }) => {
    // Get user's organization
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", authUser.id)
      .single();

    if (!orgMember) throw new Error("Organization not found");

    // Check if vendor has bills
    const { data: bills } = await supabase
      .from("bills")
      .select("id")
      .eq("vendor_id", data.id)
      .limit(1);

    if (bills && bills.length > 0) {
      throw new Error("Cannot delete vendor with existing bills");
    }

    // Delete vendor
    const { error } = await supabase.from("vendors").delete().eq("id", data.id);

    if (error) throw new Error(error.message);

    revalidatePath("/expenses/vendors");
    return { success: true };
  },
);
