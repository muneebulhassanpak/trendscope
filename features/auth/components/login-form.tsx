"use client"

import { useActionState } from "react"
import { SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { signIn, signInAsDemo } from "@/features/auth/actions"

export function LoginForm({
  next,
  demoEnabled,
}: {
  next?: string
  demoEnabled: boolean
}) {
  const [signInState, signInAction, signingIn] = useActionState(signIn, null)
  const [demoState, demoAction, enteringDemo] = useActionState(
    signInAsDemo,
    null
  )
  const fieldErrors =
    signInState?.ok === false ? signInState.fieldErrors : undefined
  const pending = signingIn || enteringDemo

  return (
    <div className="flex flex-col gap-6">
      {demoEnabled && (
        <form action={demoAction} className="flex flex-col gap-2">
          <input type="hidden" name="next" value={next ?? ""} />
          <Button type="submit" size="lg" disabled={pending}>
            {enteringDemo ? <Spinner /> : <SparklesIcon />}
            Explore as demo admin
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Read-only access to the full admin area. No sign-up needed.
          </p>
          {demoState?.ok === false && (
            <FieldError>{demoState.error}</FieldError>
          )}
        </form>
      )}

      {demoEnabled && (
        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          or sign in
        </FieldSeparator>
      )}

      <form action={signInAction} noValidate>
        <input type="hidden" name="next" value={next ?? ""} />
        <FieldGroup>
          <Field data-invalid={!!fieldErrors?.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={!!fieldErrors?.email}
            />
            <FieldError
              errors={fieldErrors?.email?.map((message) => ({ message }))}
            />
          </Field>
          <Field data-invalid={!!fieldErrors?.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={!!fieldErrors?.password}
            />
            <FieldError
              errors={fieldErrors?.password?.map((message) => ({ message }))}
            />
          </Field>
          {signInState?.ok === false && !fieldErrors && (
            <FieldError>{signInState.error}</FieldError>
          )}
          <Button type="submit" variant="outline" disabled={pending}>
            {signingIn && <Spinner />}
            Sign in
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
