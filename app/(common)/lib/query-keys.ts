// ============================================================================
// QUERY KEYS ENUM
// Centralized cache key management for React Query
// ============================================================================

export enum QueryKeys {
  // Authentication and User-related
  USER = "user",
  PROFILE = "profile",
  USER_SETTINGS = "user-settings",
  USER_PERMISSIONS = "user-permissions",

  // Dashboard and Analytics
  DASHBOARD_STATS = "dashboard-stats",
  DASHBOARD_ACTIVITY = "dashboard-activity",
  ANALYTICS = "analytics",

  // Organizations
  ORGANIZATIONS = "organizations",
  ORGANIZATION = "organization",
  ORGANIZATION_MEMBERS = "organization-members",
  ORGANIZATION_SETTINGS = "organization-settings",

  // User Management
  USERS = "users",
  USER_DETAIL = "user-detail",
  USER_ACTIVITIES = "user-activities",

  // Content and Data
  POSTS = "posts",
  POST_DETAIL = "post-detail",
  COMMENTS = "comments",
  TAGS = "tags",

  // Settings and Configuration
  APP_SETTINGS = "app-settings",
  FEATURE_FLAGS = "feature-flags",

  // External Integrations
  INTEGRATIONS = "integrations",
  WEBHOOKS = "webhooks",

  // Files and Media
  FILES = "files",
  UPLOADS = "uploads",

  // API Keys
  API_KEYS = "api-keys",

  // Notifications
  NOTIFICATIONS = "notifications",

  // Audit and Logs
  AUDIT_LOGS = "audit-logs",

  // Search and Filters
  SEARCH = "search",
  FILTERS = "filters",
}

// ============================================================================
// QUERY KEY BUILDERS
// Functions to create complex query keys with parameters
// ============================================================================

/**
 * User-related query keys
 */
export const UserQueryKeys = {
  // Current user
  current: () => [QueryKeys.USER],

  // User profile
  profile: (userId?: string) =>
    userId ? [QueryKeys.PROFILE, userId] : [QueryKeys.PROFILE],

  // User settings
  settings: (userId?: string) =>
    userId ? [QueryKeys.USER_SETTINGS, userId] : [QueryKeys.USER_SETTINGS],

  // User permissions
  permissions: (userId?: string) =>
    userId
      ? [QueryKeys.USER_PERMISSIONS, userId]
      : [QueryKeys.USER_PERMISSIONS],

  // User activities
  activities: (userId: string, filters?: Record<string, any>) =>
    filters
      ? [QueryKeys.USER_ACTIVITIES, userId, filters]
      : [QueryKeys.USER_ACTIVITIES, userId],
};

/**
 * Dashboard-related query keys
 */
export const DashboardQueryKeys = {
  // Dashboard statistics
  stats: (period: string = "month") => [QueryKeys.DASHBOARD_STATS, period],

  // Dashboard activity
  activity: (limit?: number) =>
    limit
      ? [QueryKeys.DASHBOARD_ACTIVITY, limit]
      : [QueryKeys.DASHBOARD_ACTIVITY],

  // Analytics
  analytics: (metric: string, period?: string) =>
    period
      ? [QueryKeys.ANALYTICS, metric, period]
      : [QueryKeys.ANALYTICS, metric],
};

/**
 * Organization-related query keys
 */
export const OrganizationQueryKeys = {
  // List organizations
  list: (filters?: Record<string, any>) =>
    filters ? [QueryKeys.ORGANIZATIONS, filters] : [QueryKeys.ORGANIZATIONS],

  // Single organization
  detail: (orgId: string) => [QueryKeys.ORGANIZATION, orgId],

  // Organization members
  members: (orgId: string, filters?: Record<string, any>) =>
    filters
      ? [QueryKeys.ORGANIZATION_MEMBERS, orgId, filters]
      : [QueryKeys.ORGANIZATION_MEMBERS, orgId],

  // Organization settings
  settings: (orgId: string) => [QueryKeys.ORGANIZATION_SETTINGS, orgId],
};

/**
 * Content-related query keys
 */
export const ContentQueryKeys = {
  // Posts
  posts: (filters?: Record<string, any>) =>
    filters ? [QueryKeys.POSTS, filters] : [QueryKeys.POSTS],

  // Post detail
  post: (postId: string) => [QueryKeys.POST_DETAIL, postId],

  // Comments
  comments: (postId: string, filters?: Record<string, any>) =>
    filters
      ? [QueryKeys.COMMENTS, postId, filters]
      : [QueryKeys.COMMENTS, postId],

  // Tags
  tags: () => [QueryKeys.TAGS],
};

/**
 * Settings-related query keys
 */
export const SettingsQueryKeys = {
  // App settings
  app: () => [QueryKeys.APP_SETTINGS],

  // Feature flags
  flags: () => [QueryKeys.FEATURE_FLAGS],
};

/**
 * File-related query keys
 */
export const FileQueryKeys = {
  // Files list
  files: (filters?: Record<string, any>) =>
    filters ? [QueryKeys.FILES, filters] : [QueryKeys.FILES],

  // Uploads
  uploads: (userId?: string) =>
    userId ? [QueryKeys.UPLOADS, userId] : [QueryKeys.UPLOADS],
};

/**
 * API key related query keys
 */
export const ApiKeyQueryKeys = {
  // List API keys
  list: (userId?: string) =>
    userId ? [QueryKeys.API_KEYS, userId] : [QueryKeys.API_KEYS],
};

// ============================================================================
// CACHE INVALIDATION HELPERS
// Standardized cache invalidation patterns
// ============================================================================

/**
 * Invalidate all user-related queries
 */
export const invalidateUserQueries = (queryClient: any, userId?: string) => {
  const baseKeys = [
    UserQueryKeys.current(),
    UserQueryKeys.profile(userId),
    UserQueryKeys.settings(userId),
    UserQueryKeys.permissions(userId),
  ];

  baseKeys.forEach((key) => {
    queryClient.invalidateQueries({ queryKey: key });
  });
};

/**
 * Invalidate all dashboard queries
 */
export const invalidateDashboardQueries = (queryClient: any) => {
  queryClient.invalidateQueries({ queryKey: [QueryKeys.DASHBOARD_STATS] });
  queryClient.invalidateQueries({ queryKey: [QueryKeys.DASHBOARD_ACTIVITY] });
  queryClient.invalidateQueries({ queryKey: [QueryKeys.ANALYTICS] });
};

/**
 * Invalidate all organization queries
 */
export const invalidateOrganizationQueries = (
  queryClient: any,
  orgId?: string,
) => {
  if (orgId) {
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.ORGANIZATION, orgId],
    });
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.ORGANIZATION_MEMBERS, orgId],
    });
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.ORGANIZATION_SETTINGS, orgId],
    });
  } else {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.ORGANIZATIONS] });
  }
};

/**
 * Invalidate content queries
 */
export const invalidateContentQueries = (queryClient: any, postId?: string) => {
  queryClient.invalidateQueries({ queryKey: [QueryKeys.POSTS] });
  queryClient.invalidateQueries({ queryKey: [QueryKeys.TAGS] });

  if (postId) {
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.POST_DETAIL, postId],
    });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.COMMENTS, postId] });
  }
};

// ============================================================================
// PREFETCHING HELPERS
// Standardized data prefetching patterns
// ============================================================================

/**
 * Prefetch user data
 */
export const prefetchUserData = async (queryClient: any, userId: string) => {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: UserQueryKeys.profile(userId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
    queryClient.prefetchQuery({
      queryKey: UserQueryKeys.settings(userId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
  ]);
};

/**
 * Prefetch dashboard data
 */
export const prefetchDashboardData = async (queryClient: any) => {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: DashboardQueryKeys.stats(),
      staleTime: 2 * 60 * 1000, // 2 minutes
    }),
    queryClient.prefetchQuery({
      queryKey: DashboardQueryKeys.activity(10),
      staleTime: 60 * 1000, // 1 minute
    }),
  ]);
};

// ============================================================================
// QUERY CONFIGURATION HELPERS
// Standardized query configurations
// ============================================================================

/**
 * Default query configuration for user data
 */
export const userQueryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  retry: 3,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};

/**
 * Default query configuration for real-time data
 */
export const realtimeQueryConfig = {
  staleTime: 0, // Always consider stale
  cacheTime: 1000 * 60, // 1 minute
  retry: 2,
  refetchOnWindowFocus: true,
  refetchInterval: 30 * 1000, // Refetch every 30 seconds
};

/**
 * Default query configuration for static data
 */
export const staticQueryConfig = {
  staleTime: 60 * 60 * 1000, // 1 hour
  cacheTime: 24 * 60 * 60 * 1000, // 24 hours
  retry: 1,
  refetchOnWindowFocus: false,
};
