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
import { formatNumber } from "@/lib/format"
import { deleteSource } from "@/features/sources/actions"
import type { SourceListItem } from "@/features/sources/types"

export function DeleteSourceButton({ source }: { source: SourceListItem }) {
  const [open, setOpen] = useState(false)
  const { pending, onSubmit } = useFormAction(deleteSource, {
    onSuccess: () => setOpen(false),
  })
  const cited = source.citationCount

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${source.title}`}
            className="text-muted-foreground hover:text-destructive"
          />
        }
      >
        <Trash2Icon />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={onSubmit} className="contents">
          <input type="hidden" name="id" value={source.id} />
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this source?</AlertDialogTitle>
            <AlertDialogDescription>
              {cited > 0 ? (
                <>
                  <strong className="font-medium text-foreground">
                    {source.title}
                  </strong>{" "}
                  is cited by {formatNumber(cited)}{" "}
                  {cited === 1 ? "observation" : "observations"}. Deleting it
                  removes those citations. The observations themselves stay.
                </>
              ) : (
                <>
                  <strong className="font-medium text-foreground">
                    {source.title}
                  </strong>{" "}
                  will be removed permanently.
                </>
              )}
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
              Delete source
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
