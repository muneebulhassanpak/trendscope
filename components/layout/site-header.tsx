"use client"

import { usePathname } from "next/navigation"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { findNavItem } from "@/lib/navigation"

export function SiteHeader() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const current = findNavItem(pathname)
  const isAdmin = pathname.startsWith("/admin")

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 h-4 data-vertical:self-center"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {isAdmin && (
            <>
              <BreadcrumbItem className="hidden md:block">Admin</BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{current?.title ?? "TrendScope"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto"
        aria-label="Toggle theme"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        <SunIcon className="hidden dark:block" />
        <MoonIcon className="dark:hidden" />
      </Button>
    </header>
  )
}
