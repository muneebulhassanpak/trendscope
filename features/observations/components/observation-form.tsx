"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useFormAction } from "@/hooks/use-form-action"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  createObservation,
  updateObservation,
} from "@/features/observations/actions"
import { ProductCombobox } from "@/features/observations/components/product-combobox"
import { SourceMultiSelect } from "@/features/observations/components/source-multi-select"
import { TagInput } from "@/features/observations/components/tag-input"
import { MAX_TAGS, NOTE_MAX } from "@/features/observations/schemas"
import type {
  ObservationListItem,
  ObservationProductOption,
} from "@/features/observations/types"
import type { SourceOption } from "@/features/sources/types"

/** The viewer's local calendar date as YYYY-MM-DD (the date input's format). */
function localToday() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function ObservationForm({
  observation,
  products,
  sources,
  onSaved,
}: {
  observation?: ObservationListItem
  products: ObservationProductOption[]
  sources: SourceOption[]
  onSaved: () => void
}) {
  const { pending, onSubmit, errorsFor } = useFormAction(
    observation ? updateObservation : createObservation,
    { onSuccess: onSaved }
  )
  const [note, setNote] = useState(observation?.note ?? "")
  const [today] = useState(localToday)

  const errors = {
    productId: errorsFor("productId"),
    note: errorsFor("note"),
    tags: errorsFor("tags"),
    observedAt: errorsFor("observedAt"),
    sourceIds: errorsFor("sourceIds"),
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {observation && <input type="hidden" name="id" value={observation.id} />}
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
          <Field data-invalid={!!errors.productId}>
            <FieldLabel htmlFor="observation-product">Product</FieldLabel>
            <ProductCombobox
              id="observation-product"
              name="productId"
              options={products}
              defaultValue={observation?.product.id}
              invalid={!!errors.productId}
            />
            <FieldError errors={errors.productId} />
          </Field>
          <Field data-invalid={!!errors.observedAt}>
            <FieldLabel htmlFor="observation-date">Observed</FieldLabel>
            <Input
              id="observation-date"
              name="observedAt"
              type="date"
              className="h-10"
              max={today}
              defaultValue={observation?.observed_at.slice(0, 10) ?? today}
              aria-invalid={!!errors.observedAt}
            />
            <FieldError errors={errors.observedAt} />
          </Field>
        </div>

        <Field data-invalid={!!errors.note}>
          <div className="flex items-baseline justify-between gap-2">
            <FieldLabel htmlFor="observation-note">Note</FieldLabel>
            <span
              aria-hidden
              className={cn(
                "text-xs text-muted-foreground tabular-nums",
                note.length > NOTE_MAX && "text-destructive"
              )}
            >
              {formatNumber(note.length)} / {formatNumber(NOTE_MAX)}
            </span>
          </div>
          <Textarea
            id="observation-note"
            name="note"
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="What did you see in the market?"
            className="max-h-64 min-h-24"
            aria-invalid={!!errors.note}
          />
          <FieldError errors={errors.note} />
        </Field>

        <Field data-invalid={!!errors.tags}>
          <FieldLabel htmlFor="observation-tags">Tags</FieldLabel>
          <TagInput
            id="observation-tags"
            name="tags"
            defaultValue={observation?.tags}
            invalid={!!errors.tags}
            describedBy="observation-tags-help"
          />
          <FieldDescription id="observation-tags-help">
            Press Enter or comma to add · up to {MAX_TAGS}
          </FieldDescription>
          <FieldError errors={errors.tags} />
        </Field>

        <Field data-invalid={!!errors.sourceIds}>
          <FieldLabel htmlFor="observation-sources">Sources</FieldLabel>
          <SourceMultiSelect
            id="observation-sources"
            name="sourceIds"
            options={sources}
            defaultValue={observation?.sourceIds}
            invalid={!!errors.sourceIds}
          />
          <FieldError errors={errors.sourceIds} />
        </Field>
      </FieldGroup>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          {observation ? "Save changes" : "Add observation"}
        </Button>
      </DialogFooter>
    </form>
  )
}
