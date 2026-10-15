import { Skeleton } from "@/components/ui/skeleton"

export default function TrendsLoading() {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-9 w-full sm:w-72" />
      </div>
      <Skeleton className="h-5 w-full max-w-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <Skeleton className="h-[30rem] rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
    </>
  )
}
