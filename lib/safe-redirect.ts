/** Only allow same-origin relative paths to prevent open redirects. */
export function safeRedirectPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback
  }
  return value
}
