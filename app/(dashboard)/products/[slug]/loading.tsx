import { Skeleton } from "@/components/ui/skeleton"

export default function ProductLoading() {
  return (
    <>
      <div className="flex items-center gap-4">
        <Skeleton className="size-20 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-96 lg:col-span-2" />
        <Skeleton className="h-96" />
      </div>
    </>
  )
}
