export type AgentType =
  | "ads_expert"
  | "content_creator"
  | "strategist"
  | "brand_designer"
  | "consultor";

export type PlanType = "free" | "starter" | "pro" | "agency";

export type OrgRole = "owner" | "admin" | "member";

export type ConversationStatus = "active" | "archived";

export type MessageRole = "user" | "assistant" | "system";

export type OutputType =
  | "ad_copy"
  | "strategy"
  | "audit"
  | "visual_brief"
  | "campaign"
  | "content_calendar"
  | "brand_board"
  | "audit_report";

export type OutputStatus = "draft" | "approved" | "exported";

export type BrandAssetType = "logo" | "font" | "image" | "guideline";

// Supabase-compatible Database type
// All Update types are explicit (no self-references)
export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          plan: PlanType;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          credits_remaining: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          plan?: PlanType;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          credits_remaining?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          plan?: PlanType;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          credits_remaining?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      org_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: OrgRole;
          invited_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role?: OrgRole;
          invited_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: OrgRole;
          invited_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          description: string | null;
          brand_voice: string | null;
          brand_colors: Record<string, string>;
          target_audience: Record<string, unknown>;
          industry: string | null;
          website_url: string | null;
          social_accounts: Record<string, string>;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          description?: string | null;
          brand_voice?: string | null;
          brand_colors?: Record<string, string>;
          target_audience?: Record<string, unknown>;
          industry?: string | null;
          website_url?: string | null;
          social_accounts?: Record<string, string>;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          description?: string | null;
          brand_voice?: string | null;
          brand_colors?: Record<string, string>;
          target_audience?: Record<string, unknown>;
          industry?: string | null;
          website_url?: string | null;
          social_accounts?: Record<string, string>;
          created_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          project_id: string;
          agent_type: AgentType;
          title: string | null;
          status: ConversationStatus;
          context: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          agent_type: AgentType;
          title?: string | null;
          status?: ConversationStatus;
          context?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          agent_type?: AgentType;
          title?: string | null;
          status?: ConversationStatus;
          context?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: MessageRole;
          content: string;
          metadata: Record<string, unknown>;
          tokens_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: MessageRole;
          content: string;
          metadata?: Record<string, unknown>;
          tokens_used?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: MessageRole;
          content?: string;
          metadata?: Record<string, unknown>;
          tokens_used?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      generated_outputs: {
        Row: {
          id: string;
          conversation_id: string;
          agent_type: AgentType;
          output_type: OutputType;
          content: Record<string, unknown>;
          status: OutputStatus;
          rating: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          agent_type: AgentType;
          output_type: OutputType;
          content: Record<string, unknown>;
          status?: OutputStatus;
          rating?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          agent_type?: AgentType;
          output_type?: OutputType;
          content?: Record<string, unknown>;
          status?: OutputStatus;
          rating?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      brand_assets: {
        Row: {
          id: string;
          project_id: string;
          type: BrandAssetType;
          file_url: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          type: BrandAssetType;
          file_url: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          type?: BrandAssetType;
          file_url?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Relationships: [];
      };
      usage_logs: {
        Row: {
          id: string;
          org_id: string;
          agent_type: AgentType;
          tokens_input: number;
          tokens_output: number;
          credits_consumed: number;
          conversation_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          agent_type: AgentType;
          tokens_input?: number;
          tokens_output?: number;
          credits_consumed?: number;
          conversation_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          agent_type?: AgentType;
          tokens_input?: number;
          tokens_output?: number;
          credits_consumed?: number;
          conversation_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      templates: {
        Row: {
          id: string;
          agent_type: AgentType;
          category: string | null;
          name: string;
          description: string | null;
          prompt_template: string;
          variables: Record<string, unknown>;
          is_premium: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_type: AgentType;
          category?: string | null;
          name: string;
          description?: string | null;
          prompt_template: string;
          variables?: Record<string, unknown>;
          is_premium?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          agent_type?: AgentType;
          category?: string | null;
          name?: string;
          description?: string | null;
          prompt_template?: string;
          variables?: Record<string, unknown>;
          is_premium?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
