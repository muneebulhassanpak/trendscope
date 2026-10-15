import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

/** FNV-1a: small, stable string hash so a slug always yields the same cover. */
function hash(value: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

const LINE = "rgb(255 255 255 / 0.07)"

const PATTERNS = [
  // Grid
  {
    backgroundImage: `linear-gradient(to right, ${LINE} 1px, transparent 1px), linear-gradient(to bottom, ${LINE} 1px, transparent 1px)`,
    backgroundSize: "28px 28px",
  },
  // Dots
  {
    backgroundImage:
      "radial-gradient(rgb(255 255 255 / 0.16) 1px, transparent 1.5px)",
    backgroundSize: "16px 16px",
  },
  // Fine diagonal rules
  {
    backgroundImage: `repeating-linear-gradient(135deg, ${LINE} 0 1px, transparent 1px 14px)`,
  },
  // Horizontal scan lines
  {
    backgroundImage: `repeating-linear-gradient(to bottom, ${LINE} 0 1px, transparent 1px 10px)`,
  },
] satisfies CSSProperties[]

function coverStyles(slug: string) {
  const seed = hash(slug)
  const hue = seed % 360
  const accentHue = (hue + 35 + ((seed >>> 9) % 50)) % 360
  const angle = (seed >>> 3) % 360
  const glowX = 15 + ((seed >>> 12) % 70)
  const glowY = 10 + ((seed >>> 18) % 40)

  const surface: CSSProperties = {
    backgroundImage: [
      `radial-gradient(circle at ${glowX}% ${glowY}%, oklch(0.68 0.15 ${hue} / 0.85), transparent 55%)`,
      `radial-gradient(circle at ${100 - glowX}% ${100 - glowY / 2}%, oklch(0.58 0.14 ${accentHue} / 0.7), transparent 60%)`,
      `linear-gradient(${angle}deg, oklch(0.24 0.04 ${hue}), oklch(0.14 0.02 ${accentHue}))`,
    ].join(", "),
  }
  const pattern = PATTERNS[(seed >>> 24) % PATTERNS.length]
  return { surface, pattern }
}

/**
 * Generated editorial cover: a deterministic gradient and line pattern derived
 * from the slug, so articles get distinct artwork without image assets.
 */
export function ArticleCover({
  slug,
  className,
}: {
  slug: string
  className?: string
}) {
  const { surface, pattern } = coverStyles(slug)

  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden bg-neutral-950", className)}
      style={surface}
    >
      <div
        className="absolute inset-0 mask-[radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
        style={pattern}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
      <div className="absolute inset-0 rounded-[inherit] ring-1 ring-white/10 ring-inset" />
    </div>
  )
}
