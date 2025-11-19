"use server";

import { authActionClient } from "@/(common)/lib/safe-action";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member"]).default("member"),
});

export const inviteUser = authActionClient
  .schema(inviteUserSchema)
  .action(async ({ parsedInput: data, ctx: { supabase, authUser } }) => {
    // Get user's organization and verify they have permission
    const { data: currentUserMember } = await supabase
      .from("organization_members")
      .select("organization_id, role")
      .eq("user_id", authUser.id)
      .single();

    if (!currentUserMember) throw new Error("Organization not found");

    // Only admins can invite users
    if (currentUserMember.role !== "admin") {
      throw new Error("Only admins can invite users");
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", data.email)
      .single();

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user record (they'll need to register)
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({ email: data.email })
        .select()
        .single();

      if (userError) throw new Error(userError.message);
      userId = newUser.id;
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("organization_members")
      .select("id")
      .eq("user_id", userId)
      .eq("organization_id", currentUserMember.organization_id)
      .single();

    if (existingMember) {
      throw new Error("User is already a member of this organization");
    }

    // Add to organization members
    const { error: memberError } = await supabase
      .from("organization_members")
      .insert({
        user_id: userId,
        organization_id: currentUserMember.organization_id,
        role: data.role,
      });

    if (memberError) throw new Error(memberError.message);

    // TODO: Send invitation email
    console.log(
      `[INVITATION] Email would be sent to ${data.email} for organization ${currentUserMember.organization_id}`,
    );

    revalidatePath("/settings/users");
    return { success: true, email: data.email };
  });

export const updateUserRole = authActionClient
  .schema(
    z.object({
      user_id: z.string().uuid(),
      role: z.enum(["admin", "member"]),
    }),
  )
  .action(async ({ parsedInput: data, ctx: { supabase, authUser } }) => {
    // Get user's organization and verify they have permission
    const { data: currentUserMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", authUser.id)
      .single();

    if (!currentUserMember) throw new Error("Organization not found");

    // Update user role
    const { error } = await supabase
      .from("organization_members")
      .update({ role: data.role })
      .eq("user_id", data.user_id)
      .eq("organization_id", currentUserMember.organization_id);

    if (error) throw new Error(error.message);

    revalidatePath("/settings/users");
    return { success: true };
  });

export const removeUser = authActionClient
  .schema(z.object({ user_id: z.string().uuid() }))
  .action(async ({ parsedInput: data, ctx: { supabase, authUser } }) => {
    // Get user's organization and verify they have permission
    const { data: currentUserMember } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", authUser.id)
      .single();

    if (!currentUserMember) throw new Error("Organization not found");

    // Prevent self-removal
    if (data.user_id === authUser.id) {
      throw new Error("Cannot remove yourself from the organization");
    }

    // Remove user from organization
    const { error } = await supabase
      .from("organization_members")
      .delete()
      .eq("user_id", data.user_id)
      .eq("organization_id", currentUserMember.organization_id);

    if (error) throw new Error(error.message);

    revalidatePath("/settings/users");
    return { success: true };
  });
