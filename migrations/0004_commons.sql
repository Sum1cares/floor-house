-- The Commons: cooperative benefits that unlock as house membership grows.
alter table profiles add column if not exists brought integer not null default 0;

create table if not exists house (
  id integer primary key default 1 check (id = 1),
  member_count integer not null default 0
);

insert into house (id, member_count) values (1, 19991)
on conflict (id) do nothing;

create table if not exists benefits (
  id serial primary key,
  slug text not null unique,
  name text not null,
  category text not null,
  description text not null,
  sponsor text not null default '',
  location text not null,
  unlock_at integer not null,
  capacity integer not null default 0,
  claimed integer not null default 0,
  art_key text not null,
  cadence text not null default '',
  terms text not null default ''
);

create table if not exists benefit_claims (
  user_id text not null,
  benefit_id integer not null references benefits(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, benefit_id)
);

create table if not exists recruits (
  id serial primary key,
  inviter_id text not null,
  name text not null,
  created_at timestamptz not null default now()
);
create index if not exists recruits_inviter_idx on recruits (inviter_id);

insert into benefits (slug, name, category, description, sponsor, location, unlock_at, capacity, claimed, art_key, cadence, terms) values
('pit-happy-hour', 'The Pit happy hour', 'gatherings',
 'Thursday 6–8 on the ground floor. House wine, a tab that does not exist, and whoever walked the rent roll that week. First perk the house ever bargained for — a lounge that treats Ground like a member, not a lead.',
 'The house bar', 'The Pit, Inglewood', 100, 0, 420, 'gathering', 'Every Thursday',
 'Open to every member. No guest list. Do not pitch deals before the second drink.'),
('tuesday-table', 'Tuesday members'' table', 'gatherings',
 'Eighteen seats on the Standard rooftop, once a week, donated because a cooperative of this size is a regular. Conversation is the product. The view is a side effect.',
 'The Standard Downtown LA', 'Downtown Los Angeles', 500, 18, 12, 'gathering', 'Tuesdays, 7pm',
 'Claim a seat for this week. Guests only if you brought them onto the house roll.'),
('inglewood-listening', 'Inglewood listening nights', 'stage',
 'A promoter on the 115 donated a PA and a calendar. Local acts, no ticket, members at the door. The room holds eighty. It fills when the tape is loud.',
 'Keaun & the Forum-adjacent bookers', 'Inglewood, CA', 2500, 80, 54, 'stage', 'First Friday',
 'RSVP holds a door slot. If you no-show twice, you go to the back of the next list.'),
('legal-clinic', 'Floor counsel clinic', 'sponsored',
 'Former franchise and real-estate counsel donate hours because the house already pays them on vaults. Entity questions, lease marks, the ugly paragraph in an FDD. Not your divorce.',
 'Priya Shah, of counsel', 'Remote / DTLA', 5000, 24, 11, 'sponsored', 'Monthly, two-hour blocks',
 'One block per member per quarter. Bring documents or do not book.'),
('parking-dtla', 'Jewelry-district parking', 'sponsored',
 'A garage under the adaptive-reuse vault validates members because we are converting the floors above it. Show the Floor card. Do not argue with the attendant.',
 'DTLA Adaptive Reuse GP', 'Downtown Los Angeles', 7500, 0, 890, 'sponsored', 'Whenever the garage is open',
 'Standing perk. Abuse it for a month of daily parking and it gets pulled for everyone.'),
('crenshaw-pad', 'Crenshaw crash pad', 'lodging',
 'Two guest rooms in a co-op house the solar vault already sits on. Free because the landlord is a member and the rooms were empty on purpose. Not a hotel. Not a party.',
 'Crenshaw Solar Co-op landlords', 'Crenshaw, CA', 8000, 2, 1, 'lodging', 'Two-night holds',
 'Two nights, then you leave. Clean the kitchen. Keys in the same lockbox as the solar inverters.'),
('tax-prep-week', 'Tax-prep week', 'sponsored',
 'Donated CPAs, one week in March, for members whose books are a vault position and a side hustle. They will not do your cousin''s return.',
 'Park & Ruiz, CPAs', 'South Los Angeles / remote', 10000, 40, 0, 'sponsored', 'March, annually',
 'Upload a packet or arrive with one. Capacity is forty because that is how many chairs they would donate.'),
('pasadena-inn', 'Pasadena inn nights', 'lodging',
 'A small inn near the rally book. Six nights a month, comped, because the house parks collector metal in their lot and eats breakfast there on show weekends.',
 'The Pasadena inn that stores Book One overflow', 'Pasadena, CA', 12000, 6, 4, 'lodging', 'Six nights / month, house-wide',
 'One night per member per month until the six are gone. Rally weekends are already spoken for.'),
('comedy-store-table', 'Comedy Store house table', 'stage',
 'A donated two-top that became a four-top when we crossed 15,000. The booker likes that members actually laugh. This week is full — which is the point of the next table, still locked.',
 'A member who used to work the door', 'West Hollywood, CA', 15000, 8, 8, 'stage', 'Thursday late show',
 'Claim before Tuesday. If the table is full, bring members; the second table unlocks later.'),
('dtla-lofts', 'DTLA loft crash pads', 'lodging',
 'Four airbeds in the jewelry-district floors the vault is converting. Legal, insured, ugly, free. For members who have a morning meeting and a last train they missed.',
 'DTLA Adaptive Reuse', 'Downtown Los Angeles', 18000, 4, 2, 'lodging', 'Weeknights',
 'One night. No events. Hard hats stay in the unit that is still a jobsite.'),
('inglewood-cars', 'Inglewood house cars', 'fleet',
 'Four Accords and a Tacoma behind the fourplex. Keys in a lockbox. A Fourth-floor fleet operator donated the metal because 20,000 people is a fleet and 200 is a favor. Book a day. Fill the tank.',
 'West Coast Tour Fleet, idle metal', 'Inglewood, CA', 20000, 4, 0, 'fleet', 'Day holds',
 'One car, one member, one day. Clean it. Insurance is the house''s; tickets are yours.'),
('tour-vans', 'Weekend tour vans', 'fleet',
 'When the Prevosts and Sprinters are dark, members take them. Not for a festival circuit — for a Saturday in the desert, a move, a show the house already has seats to. The vault still gets first call.',
 'West Coast Tour Fleet', 'Burbank, CA', 22500, 6, 0, 'fleet', 'Weekends, if idle',
 'Request Friday by noon. If a tour books, you lose the van. That is the deal.'),
('forum-box', 'Forum / SoFi member box', 'stage',
 'A donated suite that rotates between the Forum and SoFi depending on who had a dark night. Twelve seats. Members, not clients. The sponsor wants the house in the building, not a logo on a jumbotron.',
 'A penthouse member with leftover season inventory', 'Inglewood, CA', 25000, 12, 0, 'stage', 'Event nights, rotating',
 'Claim a seat, not the box. If you flip the seat, you are out of the Commons.'),
('city-cars', 'Burbank and Pasadena city cars', 'fleet',
 'The Inglewood lockbox was the proof. Two more cities, same terms: donated compact cars, day holds, members only. Local cities start to treat the house like a small fleet account.',
 'Donated by operators who already lease to the vaults', 'Burbank & Pasadena', 30000, 8, 0, 'fleet', 'Day holds',
 'Same rules as Inglewood. Pick the city when you claim.'),
('six-city-rooms', 'Free rooms in six cities', 'lodging',
 'Partner inns in Los Angeles, San Diego, San Francisco, Portland, Phoenix, and Las Vegas. Comped rooms because a traveling cooperative of this size is a wholesale customer a night clerk can see.',
 'A small inn cooperative, donated nights', 'LA · SD · SF · PDX · PHX · LAS', 35000, 18, 0, 'lodging', 'Eighteen nights / month, house-wide',
 'Two nights max per trip. Book ten days out. Do not treat this like Airbnb inventory.'),
('concert-series', 'House concert series', 'stage',
 'A Crenshaw venue donated one Sunday a month. Local acts, members on the floor, a hat for the band. Happy hours that grew up. The house does not promote. It shows up.',
 'The listening-night promoter, plus the venue', 'Crenshaw, CA', 40000, 200, 0, 'stage', 'Second Sunday',
 'RSVP. Capacity is the fire code. If you want a guest, they need a name on the roll.'),
('every-city-fleet', 'Company cars in every floor city', 'fleet',
 'Inglewood, Burbank, Pasadena, DTLA, and a San Diego hatchback someone''s uncle is tired of insuring. The dream the 20,000-member cars were a prototype of. A cooperative with a visible fleet gets better insurance, and better donations.',
 'House fleet + donated strays', 'Every Floor city', 50000, 20, 0, 'fleet', 'Day and weekend holds',
 'Still not yours. Still fill the tank. Still no festivals.'),
('travel-book', 'Member travel book', 'lodging',
 'Crash pads, partner rooms, and the occasional donated suite across twenty cities. The thing hotels and hosts give a 75,000-person cooperative that they will not give a group chat. Gatherings, rooms, a city you are in for a vault walk.',
 'Inns, members with spare rooms, leftover corporate nights', 'Twenty cities, published as they land', 75000, 0, 0, 'lodging', 'Standing, as inventory arrives',
 'The book is a list, not a right to a penthouse. Claim what is up. Bring members if you want more cities.')
on conflict (slug) do nothing;

insert into communities (slug, name, description, category, min_tier, member_count, rules) values
('the-commons', 'The Commons',
 'Cooperative benefits. Fleet, rooms, gatherings, donated nights. The house bargains as a bloc — more members, more perks. Ground to Penthouse, same list.',
 'commons', 'ground', 19991,
 'Recruit, do not hoard. Benefits unlock for the house. If you flip a donated seat, you are out of the room.')
on conflict (slug) do nothing;

insert into posts (community_id, author_name, author_handle, author_tier, title, body, kind, upvotes, downvotes, comment_count, created_at) values
((select id from communities where slug='the-pit'), 'Elena Voss', 'elenav', 'fourth',
 'The Commons is why you should want more members, not fewer',
 'Floors are a risk stack. The Commons is a bloc. A hotel donates rooms to 20,000 people in a way it will not to 200. Same for idle coaches, a Forum box, a lockbox of Accords behind the fourplex. Bring someone. House cars unlock at 20,000. We are close on purpose.',
 'thread', 610, 22, 34, now() - interval '90 minutes'),
((select id from communities where slug='the-commons'), 'Nia Okonkwo', 'niao', 'third',
 'Read this before you claim a crash pad',
 'These are donated or leftover. They disappear if we treat them like a perk we paid for. Fill the tank. Strip the bed. Do not invite six people to a two-bed. The next unlock is cars. Do not make the donor regret the rooms.',
 'thread', 288, 7, 16, now() - interval '5 hours');
