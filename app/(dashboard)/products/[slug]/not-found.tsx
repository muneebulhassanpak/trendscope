import Link from "next/link"
import { PackageXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function ProductNotFound() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PackageXIcon />
        </EmptyMedia>
        <EmptyTitle>Product not found</EmptyTitle>
        <EmptyDescription>
          It may have been removed from the catalog.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button nativeButton={false} render={<Link href="/products" />}>
          Browse products
        </Button>
      </EmptyContent>
    </Empty>
  )
}
