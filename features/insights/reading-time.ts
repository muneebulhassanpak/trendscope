const WORDS_PER_MINUTE = 220

/**
 * Estimated reading time in whole minutes (at least one) for a Markdown body.
 * Only tokens containing a letter or digit count, so list markers, heading
 * hashes and rules do not inflate the estimate.
 */
export function readingMinutes(markdown: string) {
  const words = markdown
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
