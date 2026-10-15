/** Display hostname of a source URL, without a leading "www.". */
export function sourceDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}
