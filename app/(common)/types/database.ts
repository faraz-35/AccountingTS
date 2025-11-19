export interface Database {
  public: {
    Tables: {
      // User profiles table
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          role: "admin" | "member" | "viewer";
          status: "active" | "inactive" | "suspended";
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          role?: "admin" | "member" | "viewer";
          status?: "active" | "inactive" | "suspended";
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          role?: "admin" | "member" | "viewer";
          status?: "active" | "inactive" | "suspended";
        };
      };

      // User settings table
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          theme: "light" | "dark" | "system";
          notifications: boolean;
          email_notifications: boolean;
          language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: "light" | "dark" | "system";
          notifications?: boolean;
          email_notifications?: boolean;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: "light" | "dark" | "system";
          notifications?: boolean;
          email_notifications?: boolean;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Activity logs table
      activities: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Record<string, any> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Record<string, any> | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };

      // Organizations table (for multi-tenant support)
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          website: string | null;
          settings: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          website?: string | null;
          settings?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          website?: string | null;
          settings?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // Organization members table
      organization_members: {
        Row: {
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
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member" | "viewer";
          permissions?: string[] | null;
          invited_by: string;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: "owner" | "admin" | "member" | "viewer";
          permissions?: string[] | null;
          invited_by?: string;
          joined_at?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      // Audit logs table
      audit_logs: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: "INSERT" | "UPDATE" | "DELETE";
          old_values: Record<string, any> | null;
          new_values: Record<string, any> | null;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          action: "INSERT" | "UPDATE" | "DELETE";
          old_values?: Record<string, any> | null;
          new_values?: Record<string, any> | null;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string;
          action?: "INSERT" | "UPDATE" | "DELETE";
          old_values?: Record<string, any> | null;
          new_values?: Record<string, any> | null;
          user_id?: string;
          created_at?: string;
        };
      };

      // API keys table
      api_keys: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          key_hash: string;
          permissions: string[];
          last_used_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          key_hash?: string;
          permissions?: string[];
          last_used_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
    };

    // Database Views
    Views: {
      user_profile_details: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          role: "admin" | "member" | "viewer";
          status: "active" | "inactive" | "suspended";
          theme: "light" | "dark" | "system";
          notifications: boolean;
          email_notifications: boolean;
          language: string;
          created_at: string;
          updated_at: string;
        };
      };

      organization_memberships: {
        Row: {
          user_id: string;
          organization_id: string;
          organization_name: string;
          role: "owner" | "admin" | "member" | "viewer";
          permissions: string[] | null;
          joined_at: string;
        };
      };

      user_activities: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Record<string, any> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          user_email: string;
          user_first_name: string | null;
          user_last_name: string | null;
        };
      };
    };

    // Database Functions
    Functions: {
      get_user_profile: {
        Args: {
          user_id: string;
        };
        Returns: Database["Views"]["user_profile_details"]["Row"] | null;
      };

      get_user_organizations: {
        Args: {
          user_id: string;
        };
        Returns: Database["Views"]["organization_memberships"]["Row"][];
      };

      update_last_activity: {
        Args: {
          user_id: string;
          activity_data?: Record<string, any>;
        };
        Returns: void;
      };

      create_audit_log: {
        Args: {
          table_name: string;
          record_id: string;
          action: "INSERT" | "UPDATE" | "DELETE";
          old_values?: Record<string, any>;
          new_values?: Record<string, any>;
          user_id: string;
        };
        Returns: void;
      };

      generate_api_key: {
        Args: {
          user_id: string;
          name: string;
          permissions: string[];
          expires_days?: number;
        };
        Returns: { api_key: string };
      };
    };

    // Database Enums
    Enums: {
      user_role: "admin" | "member" | "viewer";
      user_status: "active" | "inactive" | "suspended";
      organization_role: "owner" | "admin" | "member" | "viewer";
      audit_action: "INSERT" | "UPDATE" | "DELETE";
      theme_preference: "light" | "dark" | "system";
    };

    // Composite Types
    CompositeTypes: {
      user_profile: {
        id: string;
        email: string;
        first_name: string | null;
        last_name: string | null;
        avatar_url: string | null;
        settings: Database["Tables"]["user_settings"]["Row"] | null;
      };

      organization_info: {
        id: string;
        name: string;
        slug: string;
        member_count: number;
        created_at: string;
      };

      activity_metadata: {
        ip_address: string | null;
        user_agent: string | null;
        extra_data: Record<string, any> | null;
      };
    };
  };
}
