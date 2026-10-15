import { Skeleton } from "@/components/ui/skeleton"

export default function RankingsLoading() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between">
        <Skeleton className="h-8 w-full sm:w-md" />
        <Skeleton className="h-7 w-72 max-w-full" />
      </div>
      <Skeleton className="h-5 w-48" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 10 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </>
  )
}
