"use client"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { updateProfile } from "@/features/settings/actions"
import { useFormAction } from "@/hooks/use-form-action"

export function ProfileNameForm({ fullName }: { fullName: string | null }) {
  const { pending, onSubmit, errorsFor } = useFormAction(updateProfile)
  const errors = errorsFor("fullName")

  return (
    <form onSubmit={onSubmit} noValidate>
      <Field data-invalid={!!errors}>
        <FieldLabel htmlFor="fullName">Display name</FieldLabel>
        <div className="flex gap-2">
          <Input
            id="fullName"
            name="fullName"
            defaultValue={fullName ?? ""}
            autoComplete="name"
            maxLength={80}
            required
            aria-invalid={!!errors}
            aria-describedby="fullName-description"
          />
          <Button type="submit" variant="outline" disabled={pending}>
            {pending && <Spinner />}
            Save
          </Button>
        </div>
        {errors ? (
          <FieldError errors={errors} />
        ) : (
          <FieldDescription id="fullName-description">
            Shown in the sidebar instead of your email.
          </FieldDescription>
        )}
      </Field>
    </form>
  )
}
