import {
  FileTextIcon,
  GitCompareArrowsIcon,
  LayoutDashboardIcon,
  LinkIcon,
  NewspaperIcon,
  NotebookPenIcon,
  PackageIcon,
  RefreshCwIcon,
  SettingsIcon,
  TrendingUpIcon,
  TrophyIcon,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const mainNav: NavGroup = {
  label: "Market",
  items: [
    { title: "Dashboard", href: "/", icon: LayoutDashboardIcon },
    { title: "Products", href: "/products", icon: PackageIcon },
    { title: "Compare", href: "/compare", icon: GitCompareArrowsIcon },
    { title: "Rankings", href: "/rankings", icon: TrophyIcon },
    { title: "Trends", href: "/trends", icon: TrendingUpIcon },
    { title: "Insights", href: "/insights", icon: NewspaperIcon },
  ],
}

export const adminNav: NavGroup = {
  label: "Admin",
  items: [
    {
      title: "Observations",
      href: "/admin/observations",
      icon: NotebookPenIcon,
    },
    { title: "Articles", href: "/admin/articles", icon: FileTextIcon },
    { title: "Sources", href: "/admin/sources", icon: LinkIcon },
    { title: "Data Sync", href: "/admin/sync", icon: RefreshCwIcon },
  ],
}

export const settingsNav: NavItem = {
  title: "Settings",
  href: "/settings",
  icon: SettingsIcon,
}

const allItems = [...mainNav.items, ...adminNav.items, settingsNav]

export function isActivePath(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`)
}

export function findNavItem(pathname: string) {
  return allItems.find((item) => isActivePath(pathname, item.href))
}
