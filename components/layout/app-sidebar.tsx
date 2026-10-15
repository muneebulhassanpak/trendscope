"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ActivityIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { UserMenu } from "@/components/layout/user-menu"
import type { Viewer } from "@/lib/auth"
import {
  adminNav,
  isActivePath,
  mainNav,
  settingsNav,
  type NavGroup,
  type NavItem,
} from "@/lib/navigation"

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const { setOpenMobile } = useSidebar()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActivePath(pathname, item.href)}
        tooltip={item.title}
        render={<Link href={item.href} onClick={() => setOpenMobile(false)} />}
      >
        <item.icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function NavSection({
  group,
  pathname,
}: {
  group: NavGroup
  pathname: string
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar({ viewer }: { viewer: Viewer | null }) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ActivityIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold tracking-tight">
                  TrendScope
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Market intelligence
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavSection group={mainNav} pathname={pathname} />
        <NavSection group={adminNav} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <NavLink item={settingsNav} pathname={pathname} />
          <UserMenu viewer={viewer} />
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
