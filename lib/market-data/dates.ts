const DAY_MS = 86_400_000

/** Today's date in UTC as YYYY-MM-DD. */
export function todayUtc(now = new Date()) {
  return now.toISOString().slice(0, 10)
}

export function addDays(date: string, days: number) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MS)
    .toISOString()
    .slice(0, 10)
}

/** Days since the Unix epoch for an ISO date. */
export function toDayNumber(date: string) {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / DAY_MS)
}

/** Every ISO date from `from` to `to`, inclusive. Empty if from > to. */
export function eachDay(from: string, to: string) {
  const days: string[] = []
  for (let day = from; day <= to; day = addDays(day, 1)) {
    days.push(day)
  }
  return days
}
