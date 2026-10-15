/**
 * The trend score, as computed by `refresh_trend_snapshots()`:
 * score = 50 + 2.5 × (average 28-day price change in %), clamped to 0–100.
 */
export const SCORE_FLAT = 50
export const POINTS_PER_PERCENT = 2.5

/** The average 28-day price change a score implies (exact unless clamped at 0 or 100). */
export function impliedPriceChange(score: number) {
  return (score - SCORE_FLAT) / POINTS_PER_PERCENT
}

export function isClampedScore(score: number) {
  return score <= 0 || score >= 100
}

/** Weekly snapshots shown on the page (matches `refresh_trend_snapshots`). */
export const TREND_WEEKS = 26
/** "Change" compares the latest score with the one this many weeks earlier. */
export const CHANGE_WEEKS = 4
