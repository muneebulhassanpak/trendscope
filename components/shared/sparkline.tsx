import { cn } from "@/lib/utils"

/** Minimal inline trend line (no axes). Server-renderable SVG. */
export function Sparkline({
  values,
  className,
  width = 96,
  height = 28,
}: {
  values: number[]
  className?: string
  width?: number
  height?: number
}) {
  if (values.length < 2) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = 2
  const points = values
    .map((value, i) => {
      const x = (i / (values.length - 1)) * width
      const y = pad + (1 - (value - min) / range) * (height - pad * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
  const rising = values.at(-1)! >= values[0]!

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn(rising ? "text-positive" : "text-negative", className)}
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
