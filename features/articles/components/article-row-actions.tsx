"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  ArrowUpRightIcon,
  EyeOffIcon,
  MoreHorizontalIcon,
  PencilIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import type { ActionResult } from "@/lib/action-result"
import {
  deleteArticle,
  publishArticle,
  unpublishArticle,
} from "@/features/articles/actions"
import type { ArticleListItem } from "@/features/articles/types"

export function ArticleRowActions({
  article,
}: {
  article: Pick<ArticleListItem, "id" | "title" | "slug" | "status">
}) {
  const [pending, startTransition] = useTransition()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const published = article.status === "published"

  function run(action: () => Promise<ActionResult>, onDone?: () => void) {
    startTransition(async () => {
      const result = await action()
      if (result.ok) toast.success(result.message)
      else toast.error(result.error)
      onDone?.()
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${article.title}`}
              disabled={pending}
            />
          }
        >
          {pending ? <Spinner /> : <MoreHorizontalIcon />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuGroup>
            <DropdownMenuItem
              render={<Link href={`/admin/articles/${article.id}/edit`} />}
            >
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            {published && (
              <DropdownMenuItem
                render={<Link href={`/insights/${article.slug}`} />}
              >
                <ArrowUpRightIcon />
                View public page
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() =>
                run(() =>
                  published
                    ? unpublishArticle(article.id)
                    : publishArticle(article.id)
                )
              }
            >
              {published ? <EyeOffIcon /> : <SendIcon />}
              {published ? "Unpublish" : "Publish"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={confirmingDelete}
        onOpenChange={(open) => !pending && setConfirmingDelete(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this article?</AlertDialogTitle>
            <AlertDialogDescription>
              “{article.title}” will be removed permanently
              {published && ", including its public page"}. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={() =>
                run(
                  () => deleteArticle(article.id),
                  () => setConfirmingDelete(false)
                )
              }
            >
              {pending && <Spinner />}
              Delete article
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
