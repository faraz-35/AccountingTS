import type { User } from "@supabase/supabase-js";

// ============================================================================
// GLOBAL TYPE DEFINITIONS
// ============================================================================

/**
 * Extended User type with additional fields
 */
export interface ExtendedUser extends User {
  role?: "admin" | "member" | "viewer";
  status?: "active" | "inactive" | "suspended";
}

/**
 * User profile with settings
 */
export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  role: "admin" | "member" | "viewer";
  status: "active" | "inactive" | "suspended";
  created_at: string;
  updated_at: string;
  settings?: UserSettings;
}

/**
 * User settings preferences
 */
export interface UserSettings {
  id: string;
  user_id: string;
  theme: "light" | "dark" | "system";
  notifications: boolean;
  email_notifications: boolean;
  language: string;
  created_at: string;
  updated_at: string;
}

/**
 * Organization information
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  settings: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Organization member information
 */
export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "member" | "viewer";
  permissions: string[] | null;
  invited_by: string;
  joined_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user?: UserProfile;
  organization?: Organization;
}

/**
 * Activity log entry
 */
export interface Activity {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: UserProfile;
}

/**
 * API key information
 */
export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  permissions: string[];
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  total_users: number;
  active_users: number;
  total_organizations: number;
  recent_activities: number;
  period: string;
  last_updated: string;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

/**
 * Form submission state
 */
export interface FormState {
  isSubmitting: boolean;
  isSubmitted: boolean;
  error: string | null;
  success: string | null;
}

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  mode: "light" | "dark" | "system";
  primaryColor: string;
  accentColor: string;
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    security: boolean;
    updates: boolean;
    marketing: boolean;
    reminders: boolean;
  };
}

/**
 * Search filters interface
 */
export interface SearchFilters {
  query?: string;
  filters?: Record<string, any>;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/**
 * File upload information
 */
export interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_at: string;
  user_id: string;
}

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

/**
 * Route metadata
 */
export interface RouteMetadata {
  title: string;
  description?: string;
  keywords?: string[];
  requiresAuth?: boolean;
  roles?: ("admin" | "member" | "viewer")[];
}

/**
 * Feature flag configuration
 */
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  conditions?: Record<string, any>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Omit fields from type
 */
export type OmitFields<T, K extends keyof T> = Omit<T, K>;

/**
 * Pick fields from type
 */
export type PickFields<T, K extends keyof T> = Pick<T, K>;

/**
 * Create ID type for entities
 */
export type EntityId = string;

/**
 * Date string type
 */
export type DateString = string;

/**
 * ISO date string type
 */
export type ISODateString = string;

// ============================================================================
// CONTEXT TYPES
// ============================================================================

/**
 * Authentication context value
 */
export interface AuthContextValue {
  user: ExtendedUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * Theme context value
 */
export interface ThemeContextValue {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  resolvedTheme: "light" | "dark";
}

/**
 * Notification context value
 */
export interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "created_at">,
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

/**
 * Notification type
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  created_at: string;
}
