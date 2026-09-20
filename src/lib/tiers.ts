export const TIER_ORDER = ["ground", "second", "third", "fourth", "penthouse"] as const;
export type TierId = (typeof TIER_ORDER)[number];

export const INCOME_BANDS = [
  { id: "open", label: "Under $50k", hint: "Ground: commons funds and the market wall.", unlocks: "ground" as TierId },
  { id: "working", label: "$50k – $100k", hint: "Second: apartment syndicates, neighborhood operators.", unlocks: "second" as TierId },
  { id: "professional", label: "$100k – $250k", hint: "Third: franchises and larger multifamily.", unlocks: "third" as TierId },
  { id: "executive", label: "$250k – $1M", hint: "Fourth: land, commercial, touring fleets.", unlocks: "fourth" as TierId },
  { id: "independent", label: "$1M+ or accredited", hint: "Penthouse: the illiquid book — rally cars and private deals.", unlocks: "penthouse" as TierId },
] as const;

export type IncomeBandId = (typeof INCOME_BANDS)[number]["id"];

export type BookId = "ground" | "climb" | "penthouse";

export const TIERS: Record<
  TierId,
  {
    id: TierId;
    name: string;
    floor: string;
    minContribute: number;
    access: string;
    book: BookId;
    perks: string[];
  }
> = {
  ground: {
    id: "ground",
    name: "Ground",
    floor: "01",
    minContribute: 0,
    book: "ground",
    access: "Commons funds and the market wall. $25 is a real share.",
    perks: [
      "Street-to-Suite and other commons funds",
      "The full prediction wall",
      "The Pit and the tape",
      "Bazaar browsing",
      "Commons perks — they grow with the house, not your floor",
    ],
  },
  second: {
    id: "second",
    name: "Second",
    floor: "02",
    minContribute: 250_000,
    book: "climb",
    access: "Apartment syndicates and neighborhood operators.",
    perks: ["Multifamily vaults", "Local operator AMAs", "Secondaries on residential paper"],
  },
  third: {
    id: "third",
    name: "Third",
    floor: "03",
    minContribute: 1_000_000,
    book: "climb",
    access: "Franchises and larger multifamily.",
    perks: ["Franchise syndications", "Brand-rights deals", "Priority allocations"],
  },
  fourth: {
    id: "fourth",
    name: "Fourth",
    floor: "04",
    minContribute: 5_000_000,
    book: "climb",
    access: "Land, commercial, vehicle fleets.",
    perks: ["Land trusts", "Touring fleets", "Commercial adaptive reuse"],
  },
  penthouse: {
    id: "penthouse",
    name: "Penthouse",
    floor: "PH",
    minContribute: 25_000_000,
    book: "penthouse",
    access: "The illiquid book — rally cars and private deals.",
    perks: ["Off-market books", "Collector vehicles", "GP co-invest", "Deal-room votes"],
  },
};

export const BOOKS: Record<BookId, { id: BookId; label: string; kicker: string; blurb: string }> = {
  ground: {
    id: "ground",
    label: "Ground book",
    kicker: "Open",
    blurb: "Commons funds and the market wall. Ground can own this.",
  },
  climb: {
    id: "climb",
    label: "The climb",
    kicker: "02–04",
    blurb: "Apartments, franchises, dirt, fleets. Risk stacks as the checks get larger.",
  },
  penthouse: {
    id: "penthouse",
    label: "Penthouse book",
    kicker: "Illiquid",
    blurb: "Rally cars and private deals. Taste risk. Long holds. Invite inventory.",
  },
};

export function tierRank(tier: string): number {
  const i = TIER_ORDER.indexOf(tier as TierId);
  return i < 0 ? 0 : i;
}

export function canAccess(userTier: string, minTier: string): boolean {
  return tierRank(userTier) >= tierRank(minTier);
}

export function vaultBook(minTier: string): BookId {
  if (minTier === "ground") return "ground";
  if (minTier === "penthouse") return "penthouse";
  return "climb";
}

export function computeTier(incomeBand: string, contributedCents: number): TierId {
  const byIncome =
    INCOME_BANDS.find((b) => b.id === incomeBand)?.unlocks ?? ("ground" as TierId);
  let byCash: TierId = "ground";
  if (contributedCents >= TIERS.penthouse.minContribute) byCash = "penthouse";
  else if (contributedCents >= TIERS.fourth.minContribute) byCash = "fourth";
  else if (contributedCents >= TIERS.third.minContribute) byCash = "third";
  else if (contributedCents >= TIERS.second.minContribute) byCash = "second";
  return tierRank(byIncome) >= tierRank(byCash) ? byIncome : byCash;
}

export const CATEGORY_LABEL: Record<string, string> = {
  apartments: "Apartments",
  franchise: "Franchise",
  land: "Land",
  wheels: "Wheels",
  commercial: "Commercial",
  mixed: "Commons",
  predictions: "Predictions",
  secondary: "Secondaries",
  vehicles: "Vehicles",
  services: "Services",
  deals: "Deal flow",
  goods: "Goods",
  fleet: "Fleet",
  lodging: "Rooms",
  gatherings: "Gatherings",
  stage: "Stage",
  sponsored: "Sponsored",
  commons: "Commons",
};
