import { requireAdminArea } from "@/lib/auth"

export default async function SettingsLayout({
  children,
}: LayoutProps<"/settings">) {
  await requireAdminArea()
  return children
}
