"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/common/lib/supabase-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserQueryKeys } from "@/common/lib/query-keys";
import { getCurrentUserQuery } from "./auth-query";
import type {
  UserProfile,
  UserSettings,
  AuthContextValue,
} from "@/common/types/global";

/**
 * Authentication context for managing user state
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Authentication provider component
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createSupabaseClient());
  const queryClient = useQueryClient();

  // Query for current user data
  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: UserQueryKeys.current(),
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return null;
      }

      return getCurrentUserQuery({});
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in React Query v5)
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Set up auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await refetch();
      } else if (event === "SIGNED_OUT") {
        queryClient.setQueryData(UserQueryKeys.current(), null);
        queryClient.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, refetch, queryClient]);

  // Extract user, profile, and settings from query data
  const user = userData?.user || null;
  const profile = userData?.profile || null;
  const settings = userData?.settings || null;

  // Authentication methods
  const login = async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<void> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email!,
      ...data,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new Error(error.message);
    }

    // Invalidate and refetch profile data
    await refetch();
  };

  const refreshProfile = async (): Promise<void> => {
    await refetch();
  };

  // Computed states
  const isAuthenticated = !!user;
  const isAdmin = profile?.role === "admin";

  const value: AuthContextValue = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    updateSettings: async (data: Partial<UserSettings>) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("user_settings").upsert({
        user_id: user.id,
        ...data,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(error.message);
      }

      await refetch();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

/**
 * Hook to get current user profile with loading states
 */
export function useUserProfile() {
  const { user, profile, isLoading, isAuthenticated } = useAuth();

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
  };
}

/**
 * Hook to check if user has specific role
 */
export function useUserRole(requiredRole?: "admin" | "member" | "viewer") {
  const { profile, isAuthenticated } = useAuth();

  const hasRole = requiredRole
    ? profile?.role === requiredRole || profile?.role === "admin"
    : true;

  const isAdmin = profile?.role === "admin";

  return {
    role: profile?.role || null,
    hasRole,
    isAdmin,
    isAuthenticated,
  };
}

/**
 * Hook to get user settings
 */
export function useUserSettings() {
  const { user, profile, isLoading } = useAuth();

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: UserQueryKeys.settings(user?.id),
    queryFn: async () => {
      if (!user) return null;

      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    settings,
    isLoading: isLoading || settingsLoading,
  };
}

/**
 * Hook to get user organizations
 */
export function useUserOrganizations() {
  const { user, isAuthenticated } = useAuth();

  const {
    data: organizations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-organizations", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const supabase = createSupabaseClient();
      const { data, error } = await supabase
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

      return data;
    },
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    organizations,
    isLoading,
    error,
  };
}
