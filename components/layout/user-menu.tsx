"use client"

import Link from "next/link"
import {
  ChevronsUpDownIcon,
  LogInIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { signOut } from "@/features/auth/actions"
import type { Viewer } from "@/lib/auth"

const ROLE_LABEL: Record<Viewer["role"], string> = {
  admin: "Admin",
  demo: "Demo",
  viewer: "Viewer",
}

export function UserMenu({ viewer }: { viewer: Viewer | null }) {
  if (!viewer) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="Sign in" render={<Link href="/login" />}>
          <LogInIcon />
          <span>Sign in</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  const name = viewer.fullName ?? viewer.email
  const initials = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {viewer.email}
            </span>
          </div>
          <ChevronsUpDownIcon className="ml-auto" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="end" className="min-w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center justify-between gap-2">
              Signed in
              <Badge variant="secondary">{ROLE_LABEL[viewer.role]}</Badge>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/settings" />}>
            <SettingsIcon />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOutIcon />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
