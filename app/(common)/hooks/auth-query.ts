import { createSupabaseClient } from "@/common/lib/supabase-client";
import type { User } from "@supabase/supabase-js";
import { z } from "zod";

/**
 * Authenticated query wrapper
 * Provides automatic authentication and validation for client-side queries
 */
export function authQuery<TParams = void, TResult = any>(
  queryFn: (params: {
    supabase: any;
    user: User;
    params: TParams;
  }) => Promise<TResult>,
  options?: {
    paramsSchema?: z.ZodSchema<TParams>;
    requiredRole?: "admin" | "member" | "viewer";
  },
) {
  return async (params: TParams) => {
    const supabase = createSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("Unauthorized: User must be authenticated");
    }

    // Optional role check
    if (options?.requiredRole) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== options.requiredRole && profile?.role !== "admin") {
        throw new Error(
          `Insufficient permissions: Required role ${options.requiredRole}`,
        );
      }
    }

    // Optional input validation
    let validatedParams = params;
    if (options?.paramsSchema) {
      validatedParams = options.paramsSchema.parse(params);
    }

    return queryFn({ supabase, user, params: validatedParams });
  };
}

/**
 * Public query wrapper
 * For queries that don't require authentication
 */
export function publicQuery<TParams = void, TResult = any>(
  queryFn: (params: { supabase: any; params: TParams }) => Promise<TResult>,
  options?: {
    paramsSchema?: z.ZodSchema<TParams>;
  },
) {
  return async (params: TParams) => {
    const supabase = createSupabaseClient();

    // Optional input validation
    let validatedParams = params;
    if (options?.paramsSchema) {
      validatedParams = options.paramsSchema.parse(params);
    }

    return queryFn({ supabase, params: validatedParams });
  };
}

/**
 * Admin-only query wrapper
 * Automatically checks for admin permissions
 */
export function adminQuery<TParams = void, TResult = any>(
  queryFn: (params: {
    supabase: any;
    user: User;
    params: TParams;
  }) => Promise<TResult>,
  options?: {
    paramsSchema?: z.ZodSchema<TParams>;
  },
) {
  return authQuery(queryFn, {
    ...options,
    requiredRole: "admin",
  });
}

/**
 * Query wrappers for common auth operations
 */

/**
 * Get current user profile
 */
export const getCurrentUserQuery = authQuery(async ({ supabase, user }) => {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Get user settings
  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return {
    user,
    profile,
    settings: settings || null,
  };
});

/**
 * Get user activities
 */
export const getUserActivitiesQuery = authQuery(
  async ({ supabase, user, params }) => {
    const { limit = 20, offset = 0 } = params as {
      limit?: number;
      offset?: number;
    };

    const { data: activities, error } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(error.message);
    }

    return activities || [];
  },
);

/**
 * Get user organizations
 */
export const getUserOrganizationsQuery = authQuery(
  async ({ supabase, user }) => {
    const { data: memberships, error } = await supabase
      .from("organization_members")
      .select(
        `
        *,
        organization:organizations(*)
      `,
      )
      .eq("user_id", user.id)
      .eq("deleted_at", null)
      .order("joined_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return memberships || [];
  },
);

/**
 * Get dashboard stats
 */
export const getDashboardStatsQuery = authQuery(
  async ({ supabase, user, params }) => {
    const { period = "month" } = params as { period?: string };

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "day":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Run parallel queries for different stats
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: totalOrgs },
      { data: recentActivities },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),

      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .gte("updated_at", startDate.toISOString()),

      supabase
        .from("organizations")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("activities")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalOrganizations: totalOrgs || 0,
      recentActivities: recentActivities || [],
      period,
      lastUpdated: new Date().toISOString(),
    };
  },
);

/**
 * Get system settings (admin only)
 */
export const getSystemSettingsQuery = adminQuery(async ({ supabase }) => {
  const { data: settings, error } = await supabase
    .from("app_settings")
    .select("*")
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" error
    throw new Error(error.message);
  }

  return settings || {};
});

/**
 * Get audit logs (admin only)
 */
export const getAuditLogsQuery = adminQuery(async ({ supabase, params }) => {
  const {
    limit = 50,
    offset = 0,
    table_name,
    action,
    start_date,
    end_date,
  } = params as {
    limit?: number;
    offset?: number;
    table_name?: string;
    action?: string;
    start_date?: string;
    end_date?: string;
  };

  let query = supabase
    .from("audit_logs")
    .select(
      `
        *,
        user:profiles(email, first_name, last_name)
      `,
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (table_name) {
    query = query.eq("table_name", table_name);
  }

  if (action) {
    query = query.eq("action", action);
  }

  if (start_date) {
    query = query.gte("created_at", start_date);
  }

  if (end_date) {
    query = query.lte("created_at", end_date);
  }

  const { data: logs, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return logs || [];
});
