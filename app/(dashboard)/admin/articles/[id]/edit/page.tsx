import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArticleEditor } from "@/features/articles/components/article-editor"
import {
  getArticle,
  listArticleProductOptions,
} from "@/features/articles/queries"
import { articleIdSchema } from "@/features/articles/schemas"

export const metadata: Metadata = { title: "Edit article" }

export default async function EditArticlePage({
  params,
}: PageProps<"/admin/articles/[id]/edit">) {
  const { id } = await params
  const parsedId = articleIdSchema.safeParse(id)
  if (!parsedId.success) notFound()

  const [article, productOptions] = await Promise.all([
    getArticle(parsedId.data),
    listArticleProductOptions(),
  ])
  if (!article) notFound()

  return <ArticleEditor article={article} productOptions={productOptions} />
}
