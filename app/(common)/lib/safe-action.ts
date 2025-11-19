import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { createSupabaseServerClient } from "./supabase-server";

/**
 * Base action client with default error handling
 */
export const action = createSafeActionClient({
  handleServerError(error) {
    console.error("Server action error:", error);

    // Don't expose sensitive error details to client
    if (process.env.NODE_ENV === "production") {
      return "An unexpected error occurred";
    }

    return error.message;
  },
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },
});

/**
 * Action client for public actions (no authentication required)
 */
export const publicAction = createSafeActionClient({
  handleServerError(error) {
    console.error("Public action error:", error);

    if (process.env.NODE_ENV === "production") {
      return "An unexpected error occurred";
    }

    return error.message;
  },
});

/**
 * Enhanced action client for authenticated actions
 * Automatically includes user context and authentication check
 */
export const authAction = createSafeActionClient({
  handleServerError(error) {
    console.error("Auth action error:", error);

    if (process.env.NODE_ENV === "production") {
      return "An unexpected error occurred";
    }

    return error.message;
  },
}).use(async ({ next }) => {
  const supabase = await createSupabaseServerClient();
  const { data: authUser, error } = await supabase.auth.getUser();

  if (error || !authUser) {
    throw new Error("Unauthorized: User must be authenticated");
  }

  return next({
    ctx: {
      supabase,
      authUser,
    },
  });
});
