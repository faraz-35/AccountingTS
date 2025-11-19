import { NextRequest, NextResponse } from "next/server";
import { authAction } from "@/common/lib/safe-action";
import { z } from "zod";

// Dashboard-specific schemas
const dashboardSchemas = {
  getStats: z.object({
    period: z.enum(["day", "week", "month", "year"]).default("month"),
  }),

  updateSettings: z.object({
    theme: z.enum(["light", "dark", "system"]).optional(),
    notifications: z.boolean().optional(),
  }),
};

/**
 * GET /api/dashboard - Get dashboard data and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";

    // Validate input
    const validatedData = dashboardSchemas.getStats.parse({ period });

    // Create authenticated action
    const getDashboardStats = authAction(
      dashboardSchemas.getStats,
      async ({ period }, { supabase, authUser }) => {
        // Example: Get user's dashboard stats
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        // Example: Get user's recent activity
        const { data: activities } = await supabase
          .from("activities")
          .select("*")
          .eq("user_id", authUser.id)
          .gte("created_at", getPeriodStart(period))
          .order("created_at", { ascending: false })
          .limit(10);

        return {
          profile,
          activities: activities || [],
          period,
          last_updated: new Date().toISOString(),
        };
      },
    );

    // Execute the action
    const result = await getDashboardStats(validatedData);

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Dashboard GET error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard data",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/dashboard - Update dashboard settings
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = dashboardSchemas.updateSettings.parse(body);

    // Create authenticated action
    const updateDashboardSettings = authAction(
      dashboardSchemas.updateSettings,
      async (settings, { supabase, authUser }) => {
        const { data, error } = await supabase
          .from("user_settings")
          .upsert({
            user_id: authUser.id,
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        return data;
      },
    );

    const result = await updateDashboardSettings(validatedData);

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Dashboard POST error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update settings",
      },
      { status: 500 },
    );
  }
}

/**
 * Helper function to get period start date
 */
function getPeriodStart(period: string): string {
  const now = new Date();

  switch (period) {
    case "day":
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).toISOString();
    case "week":
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return weekStart.toISOString();
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    case "year":
      return new Date(now.getFullYear(), 0, 1).toISOString();
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }
}
