"use client"

import { useActionState, useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import type { ActionResult } from "@/lib/action-result"
import { updateUserRole } from "@/features/settings/actions"
import { USER_ROLES } from "@/features/settings/schemas"
import type { UserRole } from "@/features/settings/types"

const ROLE_ITEMS = (Object.keys(USER_ROLES) as UserRole[]).map((role) => ({
  value: role,
  label: USER_ROLES[role].label,
}))

/** Role picker for one user; every change is confirmed before it is saved. */
export function RoleSelect({
  userId,
  email,
  role,
  disabled,
}: {
  userId: string
  email: string
  role: UserRole
  disabled?: boolean
}) {
  const [confirming, setConfirming] = useState(false)
  const [nextRole, setNextRole] = useState<UserRole>(role)
  const [, action, pending] = useActionState(
    async (prev: ActionResult | null, formData: FormData) => {
      const result = await updateUserRole(prev, formData)
      if (result.ok) toast.success(result.message ?? "Role updated.")
      else toast.error(result.error)
      setConfirming(false)
      return result
    },
    null
  )

  return (
    <>
      <Select
        items={ROLE_ITEMS}
        value={role}
        onValueChange={(value) => {
          if (!value || value === role) return
          setNextRole(value)
          setConfirming(true)
        }}
        disabled={disabled || pending}
      >
        <SelectTrigger
          aria-label={`Role for ${email}`}
          className="w-28"
          size="sm"
        >
          {pending ? <Spinner /> : null}
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          align="end"
          alignItemWithTrigger={false}
          className="w-auto"
        >
          {ROLE_ITEMS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              <div className="flex flex-col">
                <span>{item.label}</span>
                <span className="text-xs text-muted-foreground">
                  {USER_ROLES[item.value].description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AlertDialog
        open={confirming}
        onOpenChange={(open) => !pending && setConfirming(open)}
      >
        <AlertDialogContent>
          <form action={action} className="contents">
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="role" value={nextRole} />
            <AlertDialogHeader>
              <AlertDialogTitle>
                Make this user {USER_ROLES[nextRole].label.toLowerCase()}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-medium break-all text-foreground">
                  {email}
                </span>{" "}
                will change from {USER_ROLES[role].label} to{" "}
                {USER_ROLES[nextRole].label}:{" "}
                {USER_ROLES[nextRole].description.toLowerCase()}. It applies on
                their next page load.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
              <Button type="submit" disabled={pending}>
                {pending && <Spinner />}
                Change role
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
