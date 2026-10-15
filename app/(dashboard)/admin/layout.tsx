import { DemoModeBanner } from "@/components/layout/demo-mode-banner"
import { requireAdminArea } from "@/lib/auth"

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const viewer = await requireAdminArea()

  return (
    <>
      {viewer.role === "demo" && <DemoModeBanner />}
      {children}
    </>
  )
}
