"use client"

import { useFormStatus } from "react-dom"
import { LogOutIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { signOut } from "@/features/auth/actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? <Spinner /> : <LogOutIcon />}
      Sign out
    </Button>
  )
}

export function SignOutButton() {
  return (
    <form action={signOut}>
      <SubmitButton />
    </form>
  )
}
