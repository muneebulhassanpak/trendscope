const PROVIDER_LABELS: Record<string, string> = {
  demo: "Demo market API",
}

/** Human-readable name for a provider's machine name (see lib/market-data). */
export function providerLabel(name: string) {
  return PROVIDER_LABELS[name] ?? name
}
