/** Editorial demo content. Product references use catalog slugs. */

export const demoSources = [
  {
    title: "Secondary market mid-year report",
    url: "https://example.com/reports/secondary-market-mid-year",
    type: "report",
  },
  {
    title: "Earth tones dominate autumn release calendars",
    url: "https://example.com/articles/earth-tones-autumn",
    type: "article",
  },
  {
    title: "Retro runner sightings — street style roundup",
    url: "https://example.com/social/retro-runner-roundup",
    type: "social",
  },
  {
    title: "Auction results: handbags & accessories",
    url: "https://example.com/reports/auction-handbags",
    type: "report",
  },
  {
    title: "Steel sports watch waitlists, explained",
    url: "https://example.com/articles/steel-watch-waitlists",
    type: "article",
  },
] as const

export const demoObservations = [
  {
    product: "asics-gel-kayano-14-cream",
    note: "Sold out within minutes at three EU retailers on restock day; resale asks moved up the same afternoon.",
    tags: ["sell-out", "retro-runner"],
    daysAgo: 2,
    sources: ["Retro runner sightings — street style roundup"],
  },
  {
    product: "adidas-samba-og-white",
    note: "Wider distribution this quarter — now stocked at mall retailers. Expect the premium to keep compressing.",
    tags: ["restock", "distribution"],
    daysAgo: 4,
    sources: [],
  },
  {
    product: "nike-dunk-low-panda",
    note: "Another general release restock confirmed for next month. Pricing likely to stay pinned near retail.",
    tags: ["oversupply"],
    daysAgo: 6,
    sources: [],
  },
  {
    product: "hermes-birkin-30-togo",
    note: "Hong Kong evening sale: black Togo examples hammered above high estimate; neutral leathers remain the safest bid.",
    tags: ["auction"],
    daysAgo: 3,
    sources: ["Auction results: handbags & accessories"],
  },
  {
    product: "rolex-daytona-126500ln",
    note: "Dealer inventory of the white dial building up again; grey market asks softened week over week.",
    tags: ["inventory", "grey-market"],
    daysAgo: 5,
    sources: ["Steel sports watch waitlists, explained"],
  },
  {
    product: "new-balance-2002r-protection-pack",
    note: "Seen repeatedly in street style coverage from Copenhagen and Seoul — grey suede is having a moment.",
    tags: ["street-style", "suede"],
    daysAgo: 8,
    sources: ["Retro runner sightings — street style roundup"],
  },
  {
    product: "hermes-kelly-28-epsom",
    note: "Etoupe and Gold continue to outperform brighter colours in private sales.",
    tags: ["color", "private-sale"],
    daysAgo: 10,
    sources: ["Earth tones dominate autumn release calendars"],
  },
  {
    product: "louis-vuitton-speedy-25",
    note: "Renewed interest after the latest campaign; listings turning over faster than last quarter.",
    tags: ["campaign", "liquidity"],
    daysAgo: 12,
    sources: ["Secondary market mid-year report"],
  },
] as const

export const demoArticles = [
  {
    slug: "the-retro-runner-takeover",
    title: "The Retro Runner Takeover",
    excerpt:
      "Mesh-and-overlay runners from the late 2000s have moved from niche to mainstream. Here is what is driving demand — and where it goes next.",
    daysAgo: 3,
    products: [
      "asics-gel-kayano-14-cream",
      "asics-gel-1130-silver",
      "new-balance-2002r-protection-pack",
      "new-balance-990v6-grey",
    ],
    body: `Running silhouettes from the late 2000s — chunky midsoles, metallic overlays, breathable mesh — have become the defining sneaker look of the moment.

## What we are seeing

- **Sell-outs on restock.** Archive runners routinely sell through on release day, even at higher production volumes.
- **Silver and cream lead.** Metallic and off-white colourways command stronger premiums than bolder options.
- **Mesh over leather.** Lighter materials are gaining ground on the leather court shoes that dominated the last cycle.

## Why it matters

The shift away from flat court shoes signals that the low-profile trend is maturing. Retro runners offer comfort, a technical look and a lower entry price than luxury alternatives.

## What to watch

Track the *material* trend score for mesh against leather over the coming weeks. If mesh keeps rising while court-shoe premiums compress, the rotation is real rather than seasonal.`,
  },
  {
    slug: "earth-tones-are-the-new-neutral",
    title: "Earth Tones Are the New Neutral",
    excerpt:
      "Beige, brown and grey are outperforming black and white across sneakers and bags. A look at the colour data behind the shift.",
    daysAgo: 7,
    products: [
      "yeezy-boost-350-bone",
      "hermes-kelly-28-epsom",
      "louis-vuitton-speedy-25",
      "nike-air-max-1-patta-waves",
    ],
    body: `For years black and white were the safest colours to buy. Our colour index suggests that is changing.

## The data

Earth tones — beige, brown, grey — show steadier momentum than classic monochrome across both sneakers and luxury bags. The pattern holds at very different price points, which points to a broad shift in taste rather than one hyped release.

## Across categories

- **Sneakers:** tonal off-white and brown suede releases sell through faster than black-and-white equivalents.
- **Bags:** neutral leathers such as Etoupe and Gold remain the most liquid colours in private and auction sales.

## Takeaway

Neutral no longer means monochrome. When choosing which colourways to stock or follow, weight earth tones more heavily than you would have a year ago.`,
  },
  {
    slug: "steel-sports-watches-cool-off",
    title: "Steel Sports Watches Cool Off",
    excerpt:
      "Premiums on the most sought-after steel references have normalised from their peak. We break down which models held up best.",
    daysAgo: 12,
    products: [
      "rolex-daytona-126500ln",
      "rolex-submariner-126610ln",
      "rolex-gmt-master-ii-pepsi",
      "audemars-piguet-royal-oak-15510st",
      "omega-speedmaster-moonwatch",
    ],
    body: `The secondary market for steel sports watches has settled into a calmer phase after an extraordinary run.

## Normalisation, not collapse

Premiums over retail have narrowed, but the most iconic references still trade well above boutique prices. Retail price increases have closed part of the gap from the other side.

## Relative strength

- **Integrated-bracelet icons** have held their premiums best.
- **Chronographs** saw the sharpest correction as dealer inventory rebuilt.
- **Below-retail references** offer value for buyers who are not chasing waitlists.

## Outlook

Expect range-bound pricing with occasional spikes around new releases and discontinuation rumours. Use the compare view to track how individual references move against each other.`,
  },
] as const

export const demoDraftArticle = {
  slug: "q4-luxury-bag-outlook",
  title: "Q4 Luxury Bag Outlook",
  excerpt:
    "Draft: how retail price rises are reshaping resale premiums for core handbag lines.",
  body: `Working draft — notes to expand:

- Retail increases vs. secondary pricing for core lines
- Which colours and leathers hold value best
- Liquidity: listing turnover by brand`,
  products: ["chanel-classic-flap-medium", "louis-vuitton-neverfull-mm"],
} as const
