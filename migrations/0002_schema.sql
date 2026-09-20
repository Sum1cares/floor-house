-- FLOOR world schema. Per-user rows carry user_id text.
create table if not exists profiles (
  user_id text primary key,
  handle text not null unique,
  display_name text not null,
  bio text not null default '',
  income_band text not null default 'open',
  tier text not null default 'ground',
  karma integer not null default 0,
  cash_cents integer not null default 2500000,
  contributed_cents integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists communities (
  id serial primary key,
  slug text not null unique,
  name text not null,
  description text not null,
  category text not null,
  min_tier text not null default 'ground',
  member_count integer not null default 0,
  rules text not null default ''
);

create table if not exists community_members (
  user_id text not null,
  community_id integer not null references communities(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (user_id, community_id)
);

create table if not exists posts (
  id serial primary key,
  community_id integer not null references communities(id),
  user_id text,
  author_name text not null,
  author_handle text not null,
  author_tier text not null default 'ground',
  title text not null default '',
  body text not null,
  kind text not null default 'thread',
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists posts_created_idx on posts (created_at desc);
create index if not exists posts_community_idx on posts (community_id);

create table if not exists comments (
  id serial primary key,
  post_id integer not null references posts(id) on delete cascade,
  parent_id integer references comments(id) on delete cascade,
  user_id text,
  author_name text not null,
  author_handle text not null,
  body text not null,
  upvotes integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on comments (post_id);

create table if not exists votes (
  user_id text not null,
  target_type text not null,
  target_id integer not null,
  value integer not null,
  primary key (user_id, target_type, target_id)
);

create table if not exists vaults (
  id serial primary key,
  slug text not null unique,
  name text not null,
  category text not null,
  location text not null,
  description text not null,
  thesis text not null,
  risk text not null,
  target_cents integer not null,
  raised_cents integer not null default 0,
  yield_bps integer not null,
  min_tier text not null default 'ground',
  min_check_cents integer not null default 2500,
  status text not null default 'open',
  members integer not null default 0,
  art_key text not null,
  hold_years integer not null default 5
);

create table if not exists vault_positions (
  user_id text not null,
  vault_id integer not null references vaults(id),
  amount_cents integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, vault_id)
);

create table if not exists markets (
  id serial primary key,
  slug text not null unique,
  question text not null,
  description text not null,
  category text not null,
  yes_price integer not null default 50,
  volume_cents integer not null default 0,
  traders integer not null default 0,
  closes_at timestamptz not null,
  status text not null default 'open',
  related_vault_id integer references vaults(id)
);

create table if not exists market_positions (
  id serial primary key,
  user_id text not null,
  market_id integer not null references markets(id),
  side text not null,
  shares integer not null,
  avg_price integer not null,
  amount_cents integer not null,
  created_at timestamptz not null default now()
);
create unique index if not exists market_positions_uniq
  on market_positions (user_id, market_id, side);

create table if not exists listings (
  id serial primary key,
  seller_user_id text,
  seller_name text not null,
  seller_handle text not null,
  title text not null,
  description text not null,
  category text not null,
  price_cents integer not null,
  location text not null default '',
  status text not null default 'open',
  art_key text not null,
  created_at timestamptz not null default now()
);

create table if not exists listing_orders (
  id serial primary key,
  listing_id integer not null references listings(id),
  buyer_id text not null,
  amount_cents integer not null,
  created_at timestamptz not null default now()
);

create table if not exists bookmarks (
  user_id text not null,
  post_id integer not null references posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create table if not exists follows (
  follower_id text not null,
  handle text not null,
  created_at timestamptz not null default now(),
  primary key (follower_id, handle)
);

create table if not exists notifications (
  id serial primary key,
  user_id text not null,
  kind text not null,
  title text not null,
  body text not null,
  href text not null default '/',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id, created_at desc);

create table if not exists distributions (
  id serial primary key,
  vault_id integer not null references vaults(id),
  label text not null,
  amount_cents integer not null,
  occurred_on date not null
);
