export type Profile = {
  user_id: string;
  handle: string;
  display_name: string;
  bio: string;
  income_band: string;
  tier: string;
  karma: number;
  cash_cents: number;
  contributed_cents: number;
  brought: number;
  created_at: string;
};

export type Community = {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: string;
  min_tier: string;
  member_count: number;
  rules: string;
};

export type Post = {
  id: number;
  community_id: number;
  community_slug: string;
  community_name: string;
  user_id: string | null;
  author_name: string;
  author_handle: string;
  author_tier: string;
  title: string;
  body: string;
  kind: string;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  restack_of: number | null;
  restack_count: number;
  restack_title: string | null;
  restack_body: string | null;
  restack_author: string | null;
  restack_handle: string | null;
  restack_community_slug: string | null;
  restack_community_name: string | null;
};

export type Comment = {
  id: number;
  post_id: number;
  parent_id: number | null;
  user_id: string | null;
  author_name: string;
  author_handle: string;
  body: string;
  upvotes: number;
  created_at: string;
};

export type Vault = {
  id: number;
  slug: string;
  name: string;
  category: string;
  location: string;
  description: string;
  thesis: string;
  risk: string;
  target_cents: number;
  raised_cents: number;
  yield_bps: number;
  min_tier: string;
  min_check_cents: number;
  status: string;
  members: number;
  art_key: string;
  hold_years: number;
};

export type Market = {
  id: number;
  slug: string;
  question: string;
  description: string;
  category: string;
  yes_price: number;
  volume_cents: number;
  traders: number;
  closes_at: string;
  status: string;
  related_vault_id: number | null;
};

export type Listing = {
  id: number;
  seller_user_id: string | null;
  seller_name: string;
  seller_handle: string;
  title: string;
  description: string;
  category: string;
  price_cents: number;
  location: string;
  status: string;
  art_key: string;
  created_at: string;
};

export type Notification = {
  id: number;
  kind: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  created_at: string;
};

export type VaultPosition = {
  vault_id: number;
  slug: string;
  name: string;
  category: string;
  amount_cents: number;
  yield_bps: number;
  art_key: string;
};

export type MarketPosition = {
  market_id: number;
  question: string;
  side: string;
  shares: number;
  avg_price: number;
  amount_cents: number;
  yes_price: number;
};

export type House = {
  id: number;
  member_count: number;
};

export type Benefit = {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  sponsor: string;
  location: string;
  unlock_at: number;
  capacity: number;
  claimed: number;
  art_key: string;
  cadence: string;
  terms: string;
};

export type BenefitClaim = {
  benefit_id: number;
  slug: string;
  name: string;
  category: string;
  art_key: string;
  location: string;
  created_at: string;
};

export type SocialState = {
  following: string[];
  saved: number[];
  joined: number[];
  restacked: number[];
};

export type TrendingFloor = {
  slug: string;
  name: string;
  heat: number;
  member_count: number;
};

export type TrendingVoice = {
  handle: string;
  name: string;
  tier: string;
  score: number;
  posts: number;
};
