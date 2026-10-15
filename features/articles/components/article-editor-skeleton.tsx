import { Skeleton } from "@/components/ui/skeleton"

/** Loading state shared by the new and edit routes; mirrors the editor layout. */
export function ArticleEditorSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-20" />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <div className="grid gap-5 rounded-xl p-4 ring-1 ring-foreground/10 sm:p-5 lg:grid-cols-2">
        <Skeleton className="h-16 lg:col-span-2" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-20 lg:col-span-2" />
      </div>
      <Skeleton className="h-[30rem] w-full rounded-xl" />
    </>
  )
}
