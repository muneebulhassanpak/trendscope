import { demoCatalog } from "@/lib/market-data/providers/demo-catalog"
import type {
  CatalogProduct,
  MarketDataProvider,
  PricePoint,
} from "@/lib/market-data/types"
import { eachDay, toDayNumber } from "@/lib/market-data/dates"

/**
 * Deterministic synthetic market: a price is a pure function of
 * (product, date), so backfills and daily syncs are idempotent and every
 * environment produces the same series. Components:
 *   resale premium × (1 + long cycle + seasonal swing + weekly drift + daily jitter)
 */
export class DemoMarketDataProvider implements MarketDataProvider {
  readonly name = "demo"

  async getCatalog() {
    return demoCatalog
  }

  async getPriceHistory(
    product: CatalogProduct,
    from: string,
    to: string
  ): Promise<PricePoint[]> {
    return eachDay(from, to).map((date) => ({
      externalId: product.externalId,
      date,
      price: priceOn(product, toDayNumber(date)),
    }))
  }
}

const PREMIUMS: Record<string, number> = {
  "hermes-birkin-30-togo": 2.05,
  "hermes-kelly-28-epsom": 1.85,
  "audemars-piguet-royal-oak-15510st": 1.9,
  "rolex-daytona-126500ln": 1.55,
  "rolex-gmt-master-ii-pepsi": 1.6,
  "rolex-submariner-126610ln": 1.35,
  "chanel-classic-flap-medium": 1.02,
  "louis-vuitton-speedy-25": 1.08,
  "louis-vuitton-neverfull-mm": 1.04,
  "omega-speedmaster-moonwatch": 0.86,
  "nike-dunk-low-panda": 0.95,
}

function priceOn(product: CatalogProduct, day: number) {
  const seed = product.externalId
  const premium = PREMIUMS[product.slug] ?? 0.95 + unit(seed, "premium") * 1.1

  const cycleAmp = 0.06 + unit(seed, "cycle-amp") * 0.14
  const cyclePeriod = 280 + unit(seed, "cycle-period") * 420
  const cyclePhase = unit(seed, "cycle-phase") * Math.PI * 2

  const seasonAmp = 0.015 + unit(seed, "season-amp") * 0.025
  const seasonPeriod = 35 + unit(seed, "season-period") * 40
  const seasonPhase = unit(seed, "season-phase") * Math.PI * 2

  const cycle =
    cycleAmp * Math.sin((2 * Math.PI * day) / cyclePeriod + cyclePhase)
  const season =
    seasonAmp * Math.sin((2 * Math.PI * day) / seasonPeriod + seasonPhase)
  const drift = weeklyNoise(seed, day) * 0.035
  const jitter = (unit(seed, `day-${day}`) - 0.5) * 0.012

  const price =
    product.retailPrice * premium * (1 + cycle + season + drift + jitter)
  return roundPrice(price)
}

/** Smoothly interpolated noise with weekly knots, in [-1, 1]. */
function weeklyNoise(seed: string, day: number) {
  const knot = Math.floor(day / 7)
  const t = (day - knot * 7) / 7
  const eased = t * t * (3 - 2 * t)
  const a = unit(seed, `week-${knot}`) * 2 - 1
  const b = unit(seed, `week-${knot + 1}`) * 2 - 1
  return a + (b - a) * eased
}

function roundPrice(price: number) {
  return price < 1000
    ? Math.round(price * 100) / 100
    : Math.round(price / 5) * 5
}

/** Deterministic value in [0, 1) from FNV-1a. */
function unit(seed: string, key: string) {
  let hash = 0x811c9dc5
  const input = `${seed}:${key}`
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0) / 0x100000000
}
