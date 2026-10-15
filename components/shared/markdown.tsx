import { createElement, type JSX } from "react"
import ReactMarkdown, { type Components, type ExtraProps } from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

const SAFE_PROTOCOLS = new Set(["http", "https", "mailto"])

/**
 * Allows only `http(s):`, `mailto:` and relative URLs; anything else
 * (`javascript:`, `data:`, protocol-relative `//host`…) becomes an empty string
 * and the link renders as plain text.
 */
export function sanitizeUrl(url: string) {
  const value = url.trim()
  // `//host` and `/\host` resolve to another origin despite looking relative.
  if (/^[/\\]{2}/.test(value)) return ""

  const colon = value.indexOf(":")
  const delimiter = value.search(/[/?#]/)
  const isRelative = colon === -1 || (delimiter !== -1 && delimiter < colon)
  if (isRelative) return value

  return SAFE_PROTOCOLS.has(value.slice(0, colon).toLowerCase()) ? value : ""
}

const isExternal = (href: string) => /^https?:/i.test(href)

type ElementProps<Tag extends keyof JSX.IntrinsicElements> =
  JSX.IntrinsicElements[Tag] & ExtraProps

/** Renders `tag` with base classes, dropping react-markdown's `node` prop. */
function styled<Tag extends keyof JSX.IntrinsicElements>(
  tag: Tag,
  classes: string,
  as: keyof JSX.IntrinsicElements = tag
) {
  function StyledElement({ node, className, ...props }: ElementProps<Tag>) {
    void node
    return createElement(as, { ...props, className: cn(classes, className) })
  }
  StyledElement.displayName = `Markdown.${tag}`
  return StyledElement
}

function MarkdownLink({ node, href, children, ...props }: ElementProps<"a">) {
  void node
  if (!href) return <span>{children}</span>
  return (
    <a
      {...props}
      href={href}
      className="font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
      {...(isExternal(href) && {
        target: "_blank",
        rel: "noopener noreferrer nofollow",
      })}
    >
      {children}
    </a>
  )
}

function MarkdownTable({ node, className, ...props }: ElementProps<"table">) {
  void node
  return (
    <div className="mt-6 overflow-x-auto rounded-lg border first:mt-0">
      <table className={cn("w-full text-left text-sm", className)} {...props} />
    </div>
  )
}

/*
 * Styled with Tailwind through a components map (no typography plugin).
 * Markdown `#` renders as an <h2>: the page title owns the only <h1>.
 */
const components: Components = {
  h1: styled(
    "h1",
    "mt-10 scroll-m-20 text-2xl font-semibold tracking-tight text-foreground first:mt-0",
    "h2"
  ),
  h2: styled(
    "h2",
    "mt-10 scroll-m-20 text-xl font-semibold tracking-tight text-foreground first:mt-0"
  ),
  h3: styled(
    "h3",
    "mt-8 scroll-m-20 text-lg font-semibold tracking-tight text-foreground first:mt-0"
  ),
  h4: styled("h4", "mt-6 font-semibold text-foreground first:mt-0"),
  p: styled("p", "mt-5 first:mt-0"),
  a: MarkdownLink,
  ul: styled(
    "ul",
    "mt-5 flex list-disc flex-col gap-2 pl-6 marker:text-muted-foreground first:mt-0 [&_ol]:mt-2 [&_ul]:mt-2"
  ),
  ol: styled(
    "ol",
    "mt-5 flex list-decimal flex-col gap-2 pl-6 marker:text-muted-foreground first:mt-0 [&_ol]:mt-2 [&_ul]:mt-2"
  ),
  li: styled("li", "pl-1"),
  strong: styled("strong", "font-semibold text-foreground"),
  em: styled("em", "italic"),
  del: styled("del", "text-muted-foreground"),
  blockquote: styled(
    "blockquote",
    "mt-6 border-l-2 border-foreground/20 pl-5 text-foreground/90 italic first:mt-0"
  ),
  hr: styled("hr", "my-10 border-border"),
  code: styled(
    "code",
    "rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.875em] text-foreground [pre_&]:bg-transparent [pre_&]:p-0"
  ),
  pre: styled(
    "pre",
    "mt-6 overflow-x-auto rounded-lg border bg-muted/50 p-4 text-sm leading-relaxed first:mt-0"
  ),
  table: MarkdownTable,
  th: styled(
    "th",
    "border-b bg-muted/50 px-3 py-2 font-medium text-foreground"
  ),
  td: styled("td", "border-b px-3 py-2 tabular-nums"),
  tr: styled("tr", "last:[&>td]:border-b-0"),
}

/**
 * Renders untrusted Markdown (GFM) safely: raw HTML is dropped, images are not
 * rendered (no third-party requests) and link targets are sanitized.
 */
export function Markdown({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "text-base leading-7 text-pretty break-words text-foreground/85",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        skipHtml
        disallowedElements={["img"]}
        urlTransform={sanitizeUrl}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
