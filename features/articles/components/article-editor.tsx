"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  EyeOffIcon,
  SaveIcon,
  SendIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { ButtonLink } from "@/components/shared/button-link"
import { PageHeader } from "@/components/shared/page-header"
import type { ActionResult } from "@/lib/action-result"
import { formatDate, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { saveArticle } from "@/features/articles/actions"
import { ArticleStatusBadge } from "@/features/articles/components/article-status-badge"
import { MarkdownEditor } from "@/features/articles/components/markdown-editor"
import { ProductMultiSelect } from "@/features/articles/components/product-multi-select"
import {
  ARTICLE_LIMITS,
  slugify,
  type ArticleIntent,
} from "@/features/articles/schemas"
import type {
  ArticleProductOption,
  ArticleStatus,
  EditableArticle,
  SavedArticle,
} from "@/features/articles/types"

type Values = {
  title: string
  slug: string
  excerpt: string
  body: string
  productIds: string[]
}

type Publication = { status: ArticleStatus; publishedAt: string | null }

function toValues(article: SavedArticle | EditableArticle | null): Values {
  return {
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    excerpt: article?.excerpt ?? "",
    body: article?.body ?? "",
    productIds: article?.productIds ?? [],
  }
}

/** Comparable form state; whitespace the server trims does not count as a change. */
function fingerprint(values: Values) {
  return JSON.stringify([
    values.title.trim(),
    values.slug.trim(),
    values.excerpt.trim(),
    values.body,
    [...values.productIds].sort(),
  ])
}

function errorsFor(messages: string[] | undefined) {
  return messages?.map((message) => ({ message }))
}

export function ArticleEditor({
  article,
  productOptions,
}: {
  article: EditableArticle | null
  productOptions: ArticleProductOption[]
}) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState(() => toValues(article))
  const [saved, setSaved] = useState(values)
  const [publication, setPublication] = useState<Publication>({
    status: article?.status ?? "draft",
    publishedAt: article?.published_at ?? null,
  })
  // A new article's slug follows its title until the slug is edited by hand.
  const [slugEdited, setSlugEdited] = useState(article !== null)

  const [state, formAction] = useActionState(
    async (previous: ActionResult<SavedArticle> | null, formData: FormData) => {
      const result = await saveArticle(previous, formData)
      if (!result.ok) {
        toast.error(result.error)
        return result
      }
      toast.success(result.message)
      setSaved(toValues(result.data))
      setPublication({
        status: result.data.status,
        publishedAt: result.data.published_at,
      })
      if (!article) router.replace(`/admin/articles/${result.data.id}/edit`)
      return result
    },
    null
  )
  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined

  const dirty = fingerprint(values) !== fingerprint(saved)
  const published = publication.status === "published"

  // Warn before leaving the page (reload, close, external link) with unsaved edits.
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  // ⌘S / Ctrl+S saves without changing the status.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "s" || !(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      const form = formRef.current
      form?.requestSubmit(
        form.querySelector<HTMLButtonElement>(
          'button[name="intent"][value="save"]'
        )
      )
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  function update(changes: Partial<Values>) {
    setValues((current) => ({ ...current, ...changes }))
  }

  function updateTitle(title: string) {
    update(slugEdited ? { title } : { title, slug: slugify(title) })
  }

  function updateSlug(input: string) {
    const slug = input.toLowerCase().replace(/\s+/g, "-")
    // Clearing the slug hands it back to the title.
    setSlugEdited(slug !== "")
    update({ slug })
  }

  const statusLine = published
    ? `Published ${publication.publishedAt ? formatDate(publication.publishedAt) : ""} — live on Insights.`
    : "Draft — only visible in the admin area."

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className="flex flex-col gap-6"
    >
      {article && <input type="hidden" name="id" value={article.id} />}

      <Link
        href="/admin/articles"
        className="-mb-2 inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        Articles
      </Link>

      <PageHeader
        title={article ? "Edit article" : "New article"}
        description={statusLine}
        actions={
          <>
            <div className="flex items-center gap-2 text-xs text-muted-foreground max-sm:w-full">
              <ArticleStatusBadge status={publication.status} />
              <span aria-live="polite">
                {dirty ? "Unsaved changes" : article ? "All changes saved" : ""}
              </span>
            </div>
            {published && (
              <ButtonLink
                href={`/insights/${saved.slug}`}
                target="_blank"
                variant="ghost"
              >
                View
                <ArrowUpRightIcon data-icon="inline-end" />
              </ButtonLink>
            )}
            {published ? (
              <>
                <SubmitButton
                  intent="unpublish"
                  icon={EyeOffIcon}
                  variant="outline"
                >
                  Unpublish
                </SubmitButton>
                <SubmitButton intent="save" icon={SaveIcon}>
                  Update
                </SubmitButton>
              </>
            ) : (
              <>
                <SubmitButton intent="save" icon={SaveIcon} variant="outline">
                  Save draft
                </SubmitButton>
                <SubmitButton intent="publish" icon={SendIcon}>
                  Publish
                </SubmitButton>
              </>
            )}
          </>
        }
      />

      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
        <FieldGroup className="grid gap-5 lg:grid-cols-2">
          <Field data-invalid={!!fieldErrors?.title} className="lg:col-span-2">
            <LabelRow
              htmlFor="title"
              label="Title"
              count={values.title.length}
              max={ARTICLE_LIMITS.titleMax}
            />
            <Input
              id="title"
              name="title"
              value={values.title}
              onChange={(event) => updateTitle(event.target.value)}
              placeholder="The Retro Runner Takeover"
              maxLength={ARTICLE_LIMITS.titleMax}
              autoComplete="off"
              aria-invalid={!!fieldErrors?.title}
              className="h-10 text-base font-medium md:text-base"
            />
            <FieldError errors={errorsFor(fieldErrors?.title)} />
          </Field>

          <Field data-invalid={!!fieldErrors?.slug}>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>/insights/</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="slug"
                name="slug"
                value={values.slug}
                onChange={(event) => updateSlug(event.target.value)}
                placeholder="the-retro-runner-takeover"
                maxLength={ARTICLE_LIMITS.slugMax}
                autoComplete="off"
                spellCheck={false}
                aria-invalid={!!fieldErrors?.slug}
                aria-describedby="slug-hint"
                className="font-mono md:text-[13px]"
              />
            </InputGroup>
            <FieldError errors={errorsFor(fieldErrors?.slug)} />
            <FieldDescription
              id="slug-hint"
              className={cn(fieldErrors?.slug && "sr-only")}
            >
              {published
                ? "Changing the slug of a published article breaks existing links."
                : slugEdited
                  ? "Lowercase letters, numbers and hyphens."
                  : "Generated from the title until you edit it."}
            </FieldDescription>
          </Field>

          <Field data-invalid={!!fieldErrors?.productIds}>
            <FieldLabel htmlFor="products">Linked products</FieldLabel>
            <ProductMultiSelect
              id="products"
              name="productIds"
              options={productOptions}
              value={values.productIds}
              onChange={(productIds) => update({ productIds })}
              invalid={!!fieldErrors?.productIds}
            />
            <FieldError errors={errorsFor(fieldErrors?.productIds)} />
          </Field>

          <Field
            data-invalid={!!fieldErrors?.excerpt}
            className="lg:col-span-2"
          >
            <LabelRow
              htmlFor="excerpt"
              label="Excerpt"
              count={values.excerpt.length}
              max={ARTICLE_LIMITS.excerptMax}
            />
            <Textarea
              id="excerpt"
              name="excerpt"
              value={values.excerpt}
              onChange={(event) => update({ excerpt: event.target.value })}
              placeholder="One or two sentences shown on report cards and under the title."
              maxLength={ARTICLE_LIMITS.excerptMax}
              rows={2}
              aria-invalid={!!fieldErrors?.excerpt}
              className="min-h-16 resize-none"
            />
            <FieldError errors={errorsFor(fieldErrors?.excerpt)} />
          </Field>
        </FieldGroup>
      </div>

      <div className="flex flex-col gap-2">
        <MarkdownEditor
          id="body"
          name="body"
          value={values.body}
          onChange={(body) => update({ body })}
          title={values.title}
          excerpt={values.excerpt}
          invalid={!!fieldErrors?.body}
          describedBy={fieldErrors?.body ? "body-error" : undefined}
        />
        <FieldError id="body-error" errors={errorsFor(fieldErrors?.body)} />
      </div>
    </form>
  )
}

function LabelRow({
  htmlFor,
  label,
  count,
  max,
}: {
  htmlFor: string
  label: string
  count: number
  max: number
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      <span
        className={cn(
          "text-xs text-muted-foreground tabular-nums",
          count >= max && "text-foreground"
        )}
      >
        {formatNumber(count)}/{formatNumber(max)}
      </span>
    </div>
  )
}

/** Submit button that posts its intent and shows a spinner while it is the one saving. */
function SubmitButton({
  intent,
  icon: Icon,
  variant,
  children,
}: {
  intent: ArticleIntent
  icon: LucideIcon
  variant?: "default" | "outline"
  children: React.ReactNode
}) {
  const { pending, data } = useFormStatus()
  const active = pending && data?.get("intent") === intent
  return (
    <Button
      type="submit"
      name="intent"
      value={intent}
      variant={variant}
      disabled={pending}
    >
      {active ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <Icon data-icon="inline-start" />
      )}
      {children}
    </Button>
  )
}
