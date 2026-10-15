import { Skeleton } from "@/components/ui/skeleton"

export default function InsightLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <Skeleton className="h-4 w-20" />
      <div className="flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <Skeleton className="h-36 rounded-xl sm:h-48 lg:h-56" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <div className="flex max-w-[68ch] flex-col gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-4 w-full last:w-1/2" />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-18 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
