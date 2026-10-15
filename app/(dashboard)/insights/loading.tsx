import { Skeleton } from "@/components/ui/skeleton"

export default function InsightsLoading() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10 lg:grid lg:grid-cols-[1.35fr_1fr]">
        <Skeleton className="aspect-video rounded-none lg:aspect-auto lg:min-h-80" />
        <div className="flex flex-col gap-4 p-5 sm:p-6 lg:justify-center lg:p-8">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl ring-1 ring-foreground/10"
          >
            <Skeleton className="aspect-video rounded-none" />
            <div className="flex flex-col gap-3 p-5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
