"use server";

import { authActionClient } from "@/(common)/lib/safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { paths } from "@/(common)/lib/paths";

const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  parent_account_id: z.string().uuid().optional().nullable(),
});

export const createAccount = authActionClient
  .schema(createAccountSchema)
  .action(async ({ parsedInput: data, ctx: { supabase, authUser } }) => {
    // 1. Get Org ID
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", authUser.id)
      .single();

    if (!orgMember) throw new Error("No organization found");

    // 2. Generate next account code
    const { data: lastAccount } = await supabase
      .from("accounts")
      .select("code")
      .eq("organization_id", orgMember.organization_id)
      .eq("type", data.type)
      .order("code", { ascending: false })
      .limit(1)
      .single();

    let nextCode = "1000";
    if (lastAccount?.code) {
      const lastNumber = parseInt(lastAccount.code);
      nextCode = (lastNumber + 1).toString().padStart(4, "0");
    }

    // 3. Insert new account
    const { error } = await supabase.from("accounts").insert({
      organization_id: orgMember.organization_id,
      code: nextCode,
      name: data.name,
      type: data.type,
      parent_account_id: data.parent_account_id || null,
    });

    if (error) throw new Error(error.message);

    revalidatePath(paths.accounting.accounts);
    return { success: true, code: nextCode };
  });

export const deleteAccount = authActionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput: data, ctx: { supabase, authUser } }) => {
    // 1. Get Org ID and verify access
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", authUser.id)
      .single();

    if (!orgMember) throw new Error("No organization found");

    // 2. Check if account exists and belongs to this org
    const { data: existingAccount } = await supabase
      .from("accounts")
      .select("id, organization_id, is_system")
      .eq("id", data.id)
      .single();

    if (
      !existingAccount ||
      existingAccount.organization_id !== orgMember.organization_id
    ) {
      throw new Error("Account not found or access denied");
    }

    if (existingAccount.is_system) {
      throw new Error("Cannot delete system accounts");
    }

    // 3. Delete account
    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", data.id);

    if (error) throw new Error(error.message);

    revalidatePath(paths.accounting.accounts);
    return { success: true };
  });
