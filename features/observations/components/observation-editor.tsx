"use client"

import { createContext, use, useState } from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { PencilIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ObservationForm } from "@/features/observations/components/observation-form"
import type {
  ObservationListItem,
  ObservationProductOption,
} from "@/features/observations/types"
import type { SourceOption } from "@/features/sources/types"

/** The observation being edited, or undefined when creating one. */
type EditorHandle = DialogPrimitive.Handle<ObservationListItem | undefined>

const EditorContext = createContext<EditorHandle | null>(null)

function useEditorHandle() {
  const handle = use(EditorContext)
  if (!handle) {
    throw new Error("Observation triggers must be inside <ObservationEditor>.")
  }
  return handle
}

/**
 * One create/edit dialog for the whole page. Rows open it through detached
 * triggers, so the product and source options are sent to the client once.
 */
export function ObservationEditor({
  products,
  sources,
  children,
}: {
  products: ObservationProductOption[]
  sources: SourceOption[]
  children: React.ReactNode
}) {
  const [handle] = useState(() =>
    DialogPrimitive.createHandle<ObservationListItem | undefined>()
  )

  return (
    <EditorContext value={handle}>
      {children}
      <DialogPrimitive.Root handle={handle}>
        {({ payload: observation }) => (
          <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {observation ? "Edit observation" : "New observation"}
              </DialogTitle>
              <DialogDescription>
                A field note on a product, shown on its public page.
              </DialogDescription>
            </DialogHeader>
            <ObservationForm
              key={observation?.id ?? "new"}
              observation={observation}
              products={products}
              sources={sources}
              onSaved={() => handle.close()}
            />
          </DialogContent>
        )}
      </DialogPrimitive.Root>
    </EditorContext>
  )
}

export function NewObservationButton() {
  const handle = useEditorHandle()
  return (
    <DialogPrimitive.Trigger
      handle={handle}
      data-slot="dialog-trigger"
      render={<Button />}
    >
      <PlusIcon data-icon="inline-start" />
      New observation
    </DialogPrimitive.Trigger>
  )
}

export function EditObservationButton({
  observation,
}: {
  observation: ObservationListItem
}) {
  const handle = useEditorHandle()
  return (
    <DialogPrimitive.Trigger
      handle={handle}
      payload={observation}
      data-slot="dialog-trigger"
      render={
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit observation on ${observation.product.name}`}
        />
      }
    >
      <PencilIcon />
    </DialogPrimitive.Trigger>
  )
}
