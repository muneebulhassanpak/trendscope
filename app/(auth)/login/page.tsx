import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ActivityIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoginForm } from "@/features/auth/components/login-form"
import { getViewer, hasAdminAccess } from "@/lib/auth"
import { serverEnv } from "@/lib/env.server"
import { safeRedirectPath } from "@/lib/safe-redirect"

export const metadata: Metadata = { title: "Sign in" }

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams
  const nextPath = safeRedirectPath(next, "/admin/observations")

  const viewer = await getViewer()
  if (hasAdminAccess(viewer)) redirect(nextPath)

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <Link
        href="/"
        className="flex items-center gap-2 font-semibold tracking-tight"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ActivityIcon className="size-4" />
        </span>
        TrendScope
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Admin area</CardTitle>
          <CardDescription>
            Manage observations, sources and published research.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm
            next={nextPath}
            demoEnabled={Boolean(
              serverEnv.DEMO_USER_EMAIL && serverEnv.DEMO_USER_PASSWORD
            )}
          />
        </CardContent>
      </Card>
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to the dashboard
      </Link>
    </main>
  )
}
