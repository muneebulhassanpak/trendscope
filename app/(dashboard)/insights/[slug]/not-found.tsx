import { FileQuestionIcon } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ButtonLink } from "@/components/shared/button-link"

export default function InsightNotFound() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionIcon />
        </EmptyMedia>
        <EmptyTitle>Report not found</EmptyTitle>
        <EmptyDescription>
          It may have been unpublished or the link is incorrect.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <ButtonLink href="/insights">Browse insights</ButtonLink>
      </EmptyContent>
    </Empty>
  )
}
