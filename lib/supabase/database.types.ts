export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      article_products: {
        Row: {
          article_id: string
          product_id: string
        }
        ComputedFields: never
        Insert: {
          article_id: string
          product_id: string
        }
        Update: {
          article_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_products_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          body: string
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["article_status"]
          title: string
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          author_id?: string | null
          body?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      observation_sources: {
        Row: {
          observation_id: string
          source_id: string
        }
        ComputedFields: never
        Insert: {
          observation_id: string
          source_id: string
        }
        Update: {
          observation_id?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "observation_sources_observation_id_fkey"
            columns: ["observation_id"]
            isOneToOne: false
            referencedRelation: "observations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observation_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      observations: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          note: string
          observed_at: string
          product_id: string
          tags: string[]
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          note: string
          observed_at?: string
          product_id: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          note?: string
          observed_at?: string
          product_id?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "observations_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "observations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          created_at: string
          id: number
          price: number
          product_id: string
          recorded_on: string
          source: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          id?: never
          price: number
          product_id: string
          recorded_on: string
          source?: string
        }
        Update: {
          created_at?: string
          id?: never
          price?: number
          product_id?: string
          recorded_on?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string
          category_id: string
          color: string | null
          created_at: string
          description: string | null
          external_id: string | null
          id: string
          image_url: string | null
          material: string | null
          name: string
          release_date: string | null
          retail_price: number | null
          search: unknown
          slug: string
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          brand_id: string
          category_id: string
          color?: string | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          material?: string | null
          name: string
          release_date?: string | null
          retail_price?: number | null
          search?: never
          slug: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          category_id?: string
          color?: string | null
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          material?: string | null
          name?: string
          release_date?: string | null
          retail_price?: number | null
          search?: never
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_overview"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_overview"
            referencedColumns: ["category_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      sources: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          title: string
          type: Database["public"]["Enums"]["source_type"]
          url: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          title: string
          type?: Database["public"]["Enums"]["source_type"]
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          title?: string
          type?: Database["public"]["Enums"]["source_type"]
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "sources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          error: string | null
          finished_at: string | null
          id: number
          provider: string
          records_updated: number
          started_at: string
          status: Database["public"]["Enums"]["sync_status"]
          trigger: string
        }
        ComputedFields: never
        Insert: {
          error?: string | null
          finished_at?: string | null
          id?: never
          provider?: string
          records_updated?: number
          started_at?: string
          status?: Database["public"]["Enums"]["sync_status"]
          trigger?: string
        }
        Update: {
          error?: string | null
          finished_at?: string | null
          id?: never
          provider?: string
          records_updated?: number
          started_at?: string
          status?: Database["public"]["Enums"]["sync_status"]
          trigger?: string
        }
        Relationships: []
      }
      trend_snapshots: {
        Row: {
          created_at: string
          dimension: Database["public"]["Enums"]["trend_dimension"]
          id: number
          period_date: string
          score: number
          value: string
        }
        ComputedFields: never
        Insert: {
          created_at?: string
          dimension: Database["public"]["Enums"]["trend_dimension"]
          id?: never
          period_date: string
          score: number
          value: string
        }
        Update: {
          created_at?: string
          dimension?: Database["public"]["Enums"]["trend_dimension"]
          id?: never
          period_date?: string
          score?: number
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      category_index_daily: {
        Row: {
          category_name: string | null
          category_slug: string | null
          index_value: number | null
          recorded_on: string | null
        }
        ComputedFields: never
        Relationships: []
      }
      market_index_daily: {
        Row: {
          index_value: number | null
          product_count: number | null
          recorded_on: string | null
        }
        ComputedFields: never
        Relationships: []
      }
      product_overview: {
        Row: {
          brand_id: string | null
          brand_name: string | null
          brand_slug: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          change_1y_pct: number | null
          change_30d_pct: number | null
          change_7d_pct: number | null
          color: string | null
          description: string | null
          id: string | null
          image_url: string | null
          latest_price: number | null
          latest_recorded_on: string | null
          material: string | null
          name: string | null
          premium_pct: number | null
          release_date: string | null
          retail_price: number | null
          search: unknown
          slug: string | null
        }
        ComputedFields: never
        Relationships: []
      }
    }
    Functions: {
      has_admin_access: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      refresh_trend_snapshots: { Args: { weeks?: number }; Returns: number }
    }
    Enums: {
      article_status: "draft" | "published"
      source_type: "article" | "report" | "social" | "other"
      sync_status: "running" | "success" | "failed"
      trend_dimension: "color" | "material" | "category"
      user_role: "admin" | "viewer" | "demo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      article_status: ["draft", "published"],
      source_type: ["article", "report", "social", "other"],
      sync_status: ["running", "success", "failed"],
      trend_dimension: ["color", "material", "category"],
      user_role: ["admin", "viewer", "demo"],
    },
  },
} as const
