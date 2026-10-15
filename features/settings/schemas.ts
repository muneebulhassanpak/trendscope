import { z } from "zod"

import type { UserRole } from "@/features/settings/types"

/** Every role with its label and what it can do, in display order. */
export const USER_ROLES = {
  admin: { label: "Admin", description: "Full access, can make changes" },
  viewer: { label: "Viewer", description: "Market pages only" },
  demo: { label: "Demo", description: "Sees the admin area, read-only" },
} as const satisfies Record<UserRole, { label: string; description: string }>

const roleValues = Object.keys(USER_ROLES) as [UserRole, ...UserRole[]]

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Enter a display name.")
    .max(80, "Keep it under 80 characters."),
})

export const updateUserRoleSchema = z.object({
  userId: z.uuid("Unknown user."),
  role: z.enum(roleValues, "Choose a valid role."),
})
