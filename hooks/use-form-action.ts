"use client"

import { startTransition, useActionState } from "react"
import { toast } from "sonner"

import type { ActionResult } from "@/lib/action-result"

type FormAction<T> = (
  prev: ActionResult<T> | null,
  formData: FormData
) => Promise<ActionResult<T>>

/**
 * Wires a server action into a form with the app's feedback conventions:
 * success → toast + `onSuccess`, field errors → inline, anything else (e.g. the
 * read-only demo message) → error toast.
 *
 * Submits through `onSubmit` rather than the form `action` prop so the fields
 * keep their values when validation fails (form actions reset the form).
 */
export function useFormAction<T>(
  action: FormAction<T>,
  { onSuccess }: { onSuccess?: (data: T) => void } = {}
) {
  const [state, dispatch, pending] = useActionState<
    ActionResult<T> | null,
    FormData
  >(async (prev, formData) => {
    const result = await action(prev, formData)
    if (result.ok) {
      if (result.message) toast.success(result.message)
      onSuccess?.(result.data)
    } else if (!result.fieldErrors) {
      toast.error(result.error)
    }
    return result
  }, null)

  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Include the clicked submit button's name/value (e.g. `intent`), as a
    // native submission would.
    const formData = new FormData(
      event.currentTarget,
      (event.nativeEvent as SubmitEvent).submitter
    )
    startTransition(() => dispatch(formData))
  }

  /** Errors for one field in the shape `<FieldError errors>` expects. */
  function errorsFor(name: string) {
    return fieldErrors?.[name]?.map((message) => ({ message }))
  }

  return { pending, onSubmit, fieldErrors, errorsFor }
}
