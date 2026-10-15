const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const currencyPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
})

const percent = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
  signDisplay: "exceptZero",
})

const number = new Intl.NumberFormat("en-US")

const score = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
})

const scoreChange = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
  signDisplay: "exceptZero",
})

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})

const longDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})

const dateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
})

const relativeTime = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" })

const durationSeconds = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
})

/** Prices under $1,000 show cents; larger prices are rounded. */
export function formatPrice(value: number | null | undefined) {
  if (value == null) return "—"
  return value < 1000 ? currencyPrecise.format(value) : currency.format(value)
}

export function formatCompactPrice(value: number | null | undefined) {
  if (value == null) return "—"
  return compactCurrency.format(value)
}

/** Signed percentage, e.g. +4.2% / −1.0%. */
export function formatPercent(value: number | null | undefined) {
  if (value == null) return "—"
  return `${percent.format(value)}%`
}

export function formatNumber(value: number | null | undefined) {
  if (value == null) return "—"
  return number.format(value)
}

/** Trend score on its 0–100 scale, e.g. 62.4. */
export function formatScore(value: number | null | undefined) {
  if (value == null) return "—"
  return score.format(value)
}

/** Signed change in trend score points (not percent), e.g. +3.2 pts. */
export function formatScoreChange(value: number | null | undefined) {
  if (value == null) return "—"
  return `${scoreChange.format(value)} pts`
}

/** Accepts ISO dates (YYYY-MM-DD) or timestamps; renders in UTC. */
export function formatShortDate(value: string | Date) {
  return shortDate.format(toDate(value))
}

export function formatDate(value: string | Date) {
  return longDate.format(toDate(value))
}

export function formatDateTime(value: string | Date) {
  return dateTime.format(toDate(value))
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
]

/** Relative to now, e.g. "3 hours ago" / "yesterday". Under a minute: "just now". */
export function formatRelativeTime(value: string | Date, now = Date.now()) {
  const seconds = (toDate(value).getTime() - now) / 1000
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) {
      return relativeTime.format(Math.round(seconds / size), unit)
    }
  }
  return "just now"
}

/** Elapsed milliseconds, e.g. 240 ms / 3.4 s / 2m 05s. */
export function formatDuration(ms: number | null | undefined) {
  if (ms == null || ms < 0) return "—"
  if (ms < 1000) return `${Math.round(ms)} ms`
  if (ms < 60_000) return `${durationSeconds.format(ms / 1000)} s`
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, "0")
  return `${minutes}m ${seconds}s`
}

function toDate(value: string | Date) {
  if (value instanceof Date) return value
  return new Date(value.length === 10 ? `${value}T00:00:00Z` : value)
}
