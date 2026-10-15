"use client"

import { useState } from "react"
import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useFormAction } from "@/hooks/use-form-action"
import { deleteObservation } from "@/features/observations/actions"
import type { ObservationListItem } from "@/features/observations/types"

export function DeleteObservationButton({
  observation,
}: {
  observation: ObservationListItem
}) {
  const [open, setOpen] = useState(false)
  const { pending, onSubmit } = useFormAction(deleteObservation, {
    onSuccess: () => setOpen(false),
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete observation on ${observation.product.name}`}
            className="text-muted-foreground hover:text-destructive"
          />
        }
      >
        <Trash2Icon />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={onSubmit} className="contents">
          <input type="hidden" name="id" value={observation.id} />
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this observation?</AlertDialogTitle>
            <AlertDialogDescription>
              The note on{" "}
              <strong className="font-medium text-foreground">
                {observation.product.name}
              </strong>{" "}
              and its source links will be removed from the product page. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              variant="destructive"
              disabled={pending}
            >
              {pending && <Spinner />}
              Delete observation
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
