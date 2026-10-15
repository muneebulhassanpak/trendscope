import { cn } from "@/lib/utils"

/** Literal product colors (an attribute of the item, not a chart series). */
const PRODUCT_COLORS: Record<string, string> = {
  Beige: "#d8c6a5",
  Black: "#232323",
  Blue: "#2f5fb3",
  Brown: "#80583a",
  Green: "#2e7d4f",
  Grey: "#8b8b8b",
  Red: "#b8322a",
  Silver: "#c3c7cc",
  White: "#efefef",
}

const LIGHT_COLORS = new Set(["Beige", "Silver", "White"])

/** Tile in the product's colorway with brand initials — stands in for product imagery. */
export function ProductSwatch({
  color,
  brand,
  size = "md",
  className,
}: {
  color: string | null
  brand: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const initials = (brand ?? "?")
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
  const isLight = color ? LIGHT_COLORS.has(color) : false

  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg font-semibold tracking-tight ring-1 ring-foreground/10",
        isLight ? "text-neutral-900" : "text-white",
        size === "sm" && "size-9 text-xs",
        size === "md" && "size-12 text-sm",
        size === "lg" && "size-20 text-xl",
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${PRODUCT_COLORS[color ?? ""] ?? "#666"} 0%, color-mix(in oklab, ${PRODUCT_COLORS[color ?? ""] ?? "#666"} 70%, black) 100%)`,
      }}
    >
      {initials}
    </div>
  )
}
