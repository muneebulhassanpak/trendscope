import { PackageXIcon } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ButtonLink } from "@/components/shared/button-link"

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
        <ButtonLink href="/products">Browse products</ButtonLink>
      </EmptyContent>
    </Empty>
  )
}
