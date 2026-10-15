import type { Enums, Tables } from "@/lib/supabase/database.types"

export type UserRole = Enums<"user_role">

export type Profile = Pick<
  Tables<"profiles">,
  "id" | "email" | "full_name" | "role" | "created_at"
>
