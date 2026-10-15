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

export default function ArticleNotFound() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileQuestionIcon />
        </EmptyMedia>
        <EmptyTitle>Article not found</EmptyTitle>
        <EmptyDescription>
          It may have been deleted or the link is incorrect.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <ButtonLink href="/admin/articles">Back to articles</ButtonLink>
      </EmptyContent>
    </Empty>
  )
}
