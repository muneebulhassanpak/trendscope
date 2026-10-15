"use client"

import { useState } from "react"
import { PencilIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useFormAction } from "@/hooks/use-form-action"
import { createSource, updateSource } from "@/features/sources/actions"
import { SOURCE_TYPE_ICONS } from "@/features/sources/components/source-type-badge"
import {
  SOURCE_TITLE_MAX,
  SOURCE_TYPE_LABELS,
  SOURCE_TYPES,
} from "@/features/sources/schemas"
import type { SourceListItem } from "@/features/sources/types"

const TYPE_ITEMS = SOURCE_TYPES.map((type) => ({
  value: type,
  label: SOURCE_TYPE_LABELS[type],
}))

/** Create a source, or edit one when `source` is given. */
export function SourceFormDialog({ source }: { source?: SourceListItem }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          source ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${source.title}`}
            />
          ) : (
            <Button />
          )
        }
      >
        {source ? (
          <PencilIcon />
        ) : (
          <>
            <PlusIcon data-icon="inline-start" />
            New source
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{source ? "Edit source" : "New source"}</DialogTitle>
          <DialogDescription>
            External research that observations can cite.
          </DialogDescription>
        </DialogHeader>
        <SourceForm source={source} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function SourceForm({
  source,
  onSaved,
}: {
  source?: SourceListItem
  onSaved: () => void
}) {
  const { pending, onSubmit, errorsFor } = useFormAction(
    source ? updateSource : createSource,
    { onSuccess: onSaved }
  )
  const titleErrors = errorsFor("title")
  const urlErrors = errorsFor("url")
  const typeErrors = errorsFor("type")

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {source && <input type="hidden" name="id" value={source.id} />}
      <FieldGroup>
        <Field data-invalid={!!titleErrors}>
          <FieldLabel htmlFor="source-title">Title</FieldLabel>
          <Input
            id="source-title"
            name="title"
            defaultValue={source?.title}
            maxLength={SOURCE_TITLE_MAX}
            placeholder="Secondary market mid-year report"
            autoComplete="off"
            aria-invalid={!!titleErrors}
          />
          <FieldError errors={titleErrors} />
        </Field>
        <Field data-invalid={!!urlErrors}>
          <FieldLabel htmlFor="source-url">URL</FieldLabel>
          <Input
            id="source-url"
            name="url"
            type="url"
            inputMode="url"
            defaultValue={source?.url}
            placeholder="https://"
            autoComplete="off"
            aria-invalid={!!urlErrors}
          />
          <FieldDescription>Full link, starting with https://</FieldDescription>
          <FieldError errors={urlErrors} />
        </Field>
        <Field data-invalid={!!typeErrors}>
          <FieldLabel htmlFor="source-type">Type</FieldLabel>
          <Select
            name="type"
            items={TYPE_ITEMS}
            defaultValue={source?.type ?? "article"}
          >
            <SelectTrigger
              id="source-type"
              className="w-full"
              aria-invalid={!!typeErrors}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_TYPES.map((type) => {
                const Icon = SOURCE_TYPE_ICONS[type]
                return (
                  <SelectItem key={type} value={type}>
                    <Icon aria-hidden className="text-muted-foreground" />
                    {SOURCE_TYPE_LABELS[type]}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <FieldError errors={typeErrors} />
        </Field>
      </FieldGroup>
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          {source ? "Save changes" : "Add source"}
        </Button>
      </DialogFooter>
    </form>
  )
}
