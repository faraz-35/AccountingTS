import { z } from "zod";

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Validates an email address
 */
export const emailSchema = z.string().email("Invalid email address");

/**
 * Validates a password with minimum requirements
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  );

/**
 * Validates UUID strings
 */
export const uuidSchema = z.string().uuid("Invalid UUID format");

/**
 * Validates optional UUID strings
 */
export const optionalUuidSchema = uuidSchema.optional().nullable();

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

/**
 * Schema for user registration
 */
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    first_name: z.string().min(1, "First name is required").optional(),
    last_name: z.string().min(1, "Last name is required").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/**
 * Schema for user login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

/**
 * Schema for password reset
 */
export const passwordResetSchema = z.object({
  email: emailSchema,
});

/**
 * Schema for password update
 */
export const passwordUpdateSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

// ============================================================================
// USER PROFILE SCHEMAS
// ============================================================================

/**
 * Schema for profile updates
 */
export const profileUpdateSchema = z.object({
  first_name: z.string().min(1, "First name is required").optional(),
  last_name: z.string().min(1, "Last name is required").optional(),
  avatar_url: z.string().url("Invalid URL").optional().nullable(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  phone: z.string().optional(),
});

/**
 * Schema for user settings
 */
export const userSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  notifications: z.boolean(),
  email_notifications: z.boolean(),
  language: z.string().min(2).max(5),
});

// ============================================================================
// DASHBOARD SCHEMAS
// ============================================================================

/**
 * Schema for dashboard statistics request
 */
export const dashboardStatsSchema = z.object({
  period: z.enum(["day", "week", "month", "year"]).default("month"),
  metrics: z.array(z.string()).optional(),
});

/**
 * Schema for activity logs
 */
export const activitySchema = z.object({
  action: z.string(),
  entity_type: z.string(),
  entity_id: optionalUuidSchema,
  metadata: z.record(z.any()).optional(),
});

// ============================================================================
// ORGANIZATION SCHEMAS (for multi-tenant support)
// ============================================================================

/**
 * Schema for organization creation
 */
export const organizationCreateSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z
    .string()
    .min(1, "Organization slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  description: z.string().optional(),
  website: z.string().url().optional().nullable(),
});

/**
 * Schema for organization update
 */
export const organizationUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  website: z.string().url().optional().nullable(),
  settings: z.record(z.any()).optional(),
});

/**
 * Schema for organization member management
 */
export const organizationMemberSchema = z.object({
  user_id: uuidSchema,
  role: z.enum(["owner", "admin", "member", "viewer"]),
  permissions: z.array(z.string()).optional(),
});

// ============================================================================
// UTILITY SCHEMAS
// ============================================================================

/**
 * Schema for pagination
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Schema for search filters
 */
export const searchSchema = z.object({
  query: z.string().optional(),
  filters: z.record(z.any()).optional(),
});

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Schema for bulk user updates
 */
export const bulkUpdateUsersSchema = z.object({
  user_ids: z.array(uuidSchema).min(1, "At least one user ID is required"),
  updates: z.object({
    role: z.enum(["admin", "member"]).optional(),
    status: z.enum(["active", "inactive"]).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
export type DashboardStatsInput = z.infer<typeof dashboardStatsSchema>;
export type ActivityInput = z.infer<typeof activitySchema>;
export type OrganizationCreateInput = z.infer<typeof organizationCreateSchema>;
export type OrganizationUpdateInput = z.infer<typeof organizationUpdateSchema>;
export type OrganizationMemberInput = z.infer<typeof organizationMemberSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type BulkUpdateUsersInput = z.infer<typeof bulkUpdateUsersSchema>;
