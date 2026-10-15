import type { CatalogProduct } from "@/lib/market-data/types"

const brands = {
  nike: { name: "Nike", slug: "nike" },
  jordan: { name: "Jordan", slug: "jordan" },
  adidas: { name: "Adidas", slug: "adidas" },
  newBalance: { name: "New Balance", slug: "new-balance" },
  asics: { name: "Asics", slug: "asics" },
  louisVuitton: { name: "Louis Vuitton", slug: "louis-vuitton" },
  hermes: { name: "Hermès", slug: "hermes" },
  chanel: { name: "Chanel", slug: "chanel" },
  rolex: { name: "Rolex", slug: "rolex" },
  omega: { name: "Omega", slug: "omega" },
  audemarsPiguet: { name: "Audemars Piguet", slug: "audemars-piguet" },
} as const

const categories = {
  sneakers: { name: "Sneakers", slug: "sneakers" },
  bags: { name: "Bags", slug: "bags" },
  watches: { name: "Watches", slug: "watches" },
} as const

type Entry = Omit<CatalogProduct, "externalId">

const entries: Entry[] = [
  {
    name: "Air Jordan 1 Retro High OG Chicago",
    slug: "air-jordan-1-chicago",
    brand: brands.jordan,
    category: categories.sneakers,
    color: "Red",
    material: "Leather",
    retailPrice: 180,
    releaseDate: "2022-11-19",
    description:
      "The 'Lost & Found' reissue of the 1985 original, with a cracked-leather finish and vintage box.",
  },
  {
    name: "Nike Dunk Low Panda",
    slug: "nike-dunk-low-panda",
    brand: brands.nike,
    category: categories.sneakers,
    color: "Black",
    material: "Leather",
    retailPrice: 115,
    releaseDate: "2021-03-10",
    description:
      "The best-selling black and white Dunk, restocked repeatedly — a benchmark for general-release supply.",
  },
  {
    name: "Nike Air Max 1 Patta Waves",
    slug: "nike-air-max-1-patta-waves",
    brand: brands.nike,
    category: categories.sneakers,
    color: "Brown",
    material: "Suede",
    retailPrice: 160,
    releaseDate: "2021-11-05",
    description:
      "Patta's wavy mudguard collaboration in earthy suede, released with a matching bracelet.",
  },
  {
    name: "Adidas Samba OG Cloud White",
    slug: "adidas-samba-og-white",
    brand: brands.adidas,
    category: categories.sneakers,
    color: "White",
    material: "Leather",
    retailPrice: 100,
    releaseDate: "2023-01-15",
    description:
      "The terrace classic that defined the low-profile trend, with gum sole and suede T-toe.",
  },
  {
    name: "Adidas Gazelle Indoor Blue Fusion",
    slug: "adidas-gazelle-indoor-blue",
    brand: brands.adidas,
    category: categories.sneakers,
    color: "Blue",
    material: "Suede",
    retailPrice: 120,
    releaseDate: "2023-09-01",
    description:
      "Indoor-court Gazelle in saturated blue suede with a translucent gum outsole.",
  },
  {
    name: "Adidas Yeezy Boost 350 V2 Bone",
    slug: "yeezy-boost-350-bone",
    brand: brands.adidas,
    category: categories.sneakers,
    color: "Beige",
    material: "Knit",
    retailPrice: 230,
    releaseDate: "2022-03-04",
    description:
      "Tonal off-white Primeknit 350 V2; pricing has tracked the wider Yeezy supply story.",
  },
  {
    name: "New Balance 550 White Green",
    slug: "new-balance-550-white-green",
    brand: brands.newBalance,
    category: categories.sneakers,
    color: "Green",
    material: "Leather",
    retailPrice: 110,
    releaseDate: "2021-06-01",
    description:
      "The revived 1989 basketball silhouette in its most recognisable colourway.",
  },
  {
    name: "New Balance 2002R Protection Pack Rain Cloud",
    slug: "new-balance-2002r-protection-pack",
    brand: brands.newBalance,
    category: categories.sneakers,
    color: "Grey",
    material: "Suede",
    retailPrice: 150,
    releaseDate: "2021-08-20",
    description:
      "Deconstructed, raw-edged suede layers on the 2002R chassis — a cult favourite of the retro runner wave.",
  },
  {
    name: "New Balance 990v6 Grey",
    slug: "new-balance-990v6-grey",
    brand: brands.newBalance,
    category: categories.sneakers,
    color: "Grey",
    material: "Mesh",
    retailPrice: 200,
    releaseDate: "2023-04-20",
    description:
      "Made in USA 990 in signature grey; steady demand with little resale volatility.",
  },
  {
    name: "Asics Gel-Kayano 14 Cream Black",
    slug: "asics-gel-kayano-14-cream",
    brand: brands.asics,
    category: categories.sneakers,
    color: "Beige",
    material: "Mesh",
    retailPrice: 150,
    releaseDate: "2023-02-10",
    description:
      "The 2008 runner revived in cream and metallic overlays — central to the Y2K running trend.",
  },
  {
    name: "Asics Gel-1130 Pure Silver",
    slug: "asics-gel-1130-silver",
    brand: brands.asics,
    category: categories.sneakers,
    color: "Silver",
    material: "Mesh",
    retailPrice: 110,
    releaseDate: "2023-07-12",
    description:
      "Silver mesh and synthetic overlays on an affordable archive runner.",
  },
  {
    name: "Louis Vuitton Speedy Bandoulière 25",
    slug: "louis-vuitton-speedy-25",
    brand: brands.louisVuitton,
    category: categories.bags,
    color: "Brown",
    material: "Canvas",
    retailPrice: 2100,
    releaseDate: "2019-01-01",
    description:
      "Monogram canvas Speedy with detachable strap; one of the most liquid luxury bags on the secondary market.",
  },
  {
    name: "Louis Vuitton Neverfull MM",
    slug: "louis-vuitton-neverfull-mm",
    brand: brands.louisVuitton,
    category: categories.bags,
    color: "Brown",
    material: "Canvas",
    retailPrice: 2030,
    releaseDate: "2019-01-01",
    description:
      "Monogram tote with side laces; retail increases have pushed resale close to boutique pricing.",
  },
  {
    name: "Hermès Birkin 30 Togo",
    slug: "hermes-birkin-30-togo",
    brand: brands.hermes,
    category: categories.bags,
    color: "Black",
    material: "Leather",
    retailPrice: 12100,
    releaseDate: "2018-01-01",
    description:
      "Black Togo leather with gold hardware — the archetypal investment bag, trading well above retail.",
  },
  {
    name: "Hermès Kelly 28 Epsom",
    slug: "hermes-kelly-28-epsom",
    brand: brands.hermes,
    category: categories.bags,
    color: "Beige",
    material: "Leather",
    retailPrice: 11400,
    releaseDate: "2018-01-01",
    description:
      "Structured Sellier Kelly in Etoupe Epsom leather; neutral tones command the strongest premiums.",
  },
  {
    name: "Chanel Classic Flap Medium",
    slug: "chanel-classic-flap-medium",
    brand: brands.chanel,
    category: categories.bags,
    color: "Black",
    material: "Leather",
    retailPrice: 10400,
    releaseDate: "2019-01-01",
    description:
      "Quilted caviar leather with interlocking CC turn-lock; repeated price rises keep resale close to retail.",
  },
  {
    name: "Rolex Submariner Date 126610LN",
    slug: "rolex-submariner-126610ln",
    brand: brands.rolex,
    category: categories.watches,
    color: "Black",
    material: "Steel",
    retailPrice: 10650,
    releaseDate: "2020-09-01",
    description:
      "The 41mm Submariner Date in Oystersteel — the reference point for steel sports watch demand.",
  },
  {
    name: "Rolex Cosmograph Daytona 126500LN",
    slug: "rolex-daytona-126500ln",
    brand: brands.rolex,
    category: categories.watches,
    color: "White",
    material: "Steel",
    retailPrice: 15900,
    releaseDate: "2023-03-29",
    description:
      "White 'Panda' dial Daytona with Cerachrom bezel; secondary premiums have cooled from their 2022 peak.",
  },
  {
    name: "Rolex GMT-Master II Pepsi 126710BLRO",
    slug: "rolex-gmt-master-ii-pepsi",
    brand: brands.rolex,
    category: categories.watches,
    color: "Blue",
    material: "Steel",
    retailPrice: 11250,
    releaseDate: "2018-03-20",
    description:
      "Red and blue ceramic bezel on a Jubilee bracelet; a perennial waitlist watch.",
  },
  {
    name: "Omega Speedmaster Moonwatch Professional",
    slug: "omega-speedmaster-moonwatch",
    brand: brands.omega,
    category: categories.watches,
    color: "Black",
    material: "Steel",
    retailPrice: 7600,
    releaseDate: "2021-01-05",
    description:
      "Co-axial Master Chronometer 3861 Moonwatch; typically trades below retail on the secondary market.",
  },
  {
    name: "Audemars Piguet Royal Oak 15510ST",
    slug: "audemars-piguet-royal-oak-15510st",
    brand: brands.audemarsPiguet,
    category: categories.watches,
    color: "Blue",
    material: "Steel",
    retailPrice: 29600,
    releaseDate: "2022-01-10",
    description:
      "41mm Royal Oak with 'Grande Tapisserie' blue dial; integrated-bracelet icon with a deep premium.",
  },
]

export const demoCatalog: CatalogProduct[] = entries.map((entry) => ({
  ...entry,
  externalId: `demo:${entry.slug}`,
}))
