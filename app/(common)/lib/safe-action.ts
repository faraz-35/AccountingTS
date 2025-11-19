import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { createSupabaseServerClient } from "./supabase-server";

export const actionClient = createSafeActionClient({
  handleServerError(error) {
    console.error("Server action error:", error);
    return error.message;
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized: User must be authenticated");
  }

  return next({
    ctx: {
      supabase,
      authUser: user,
    },
  });
});
