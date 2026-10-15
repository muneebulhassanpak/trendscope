import type { Metadata } from "next"

import { ArticleEditor } from "@/features/articles/components/article-editor"
import { listArticleProductOptions } from "@/features/articles/queries"

export const metadata: Metadata = { title: "New article" }

export default async function NewArticlePage() {
  const productOptions = await listArticleProductOptions()
  return <ArticleEditor article={null} productOptions={productOptions} />
}
