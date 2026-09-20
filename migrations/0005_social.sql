-- Restacks (X-style) plus comment seed so nested diligence is visible on first paint.
alter table posts add column if not exists restack_of integer references posts(id) on delete set null;
alter table posts add column if not exists restack_count integer not null default 0;
create index if not exists posts_restack_idx on posts (restack_of);
create index if not exists follows_handle_idx on follows (handle);

insert into comments (post_id, parent_id, author_name, author_handle, body, upvotes, created_at)
select p.id, null, 'Priya Shah', 'priyas',
 'Insurance at $14.2k is the number that should have been in the teaser. I still like the basis. I would not underwrite the cousin lease as market.',
 56, now() - interval '8 hours'
from posts p
where p.title like 'Inglewood Fourplex%' and p.kind = 'dd'
limit 1;

insert into comments (post_id, parent_id, author_name, author_handle, body, upvotes, created_at)
select p.id, c.id, 'Diego Ortega', 'diegoo',
 'The cousin rolls in March. That is the occupancy market, not a footnote. Size YES smaller if the 2-bed stays sticky.',
 24, now() - interval '7 hours'
from posts p
join comments c on c.post_id = p.id and c.author_handle = 'priyas' and c.parent_id is null
where p.title like 'Inglewood Fourplex%' and p.kind = 'dd'
limit 1;

insert into comments (post_id, parent_id, author_name, author_handle, body, upvotes, created_at)
select p.id, null, 'Nia Okonkwo', 'niao',
 'Walked the 115 stop at 8am. The bus story is real. Stadium narrative is for the listing agent.',
 41, now() - interval '6 hours'
from posts p
where p.title like 'Inglewood Fourplex%' and p.kind = 'dd'
limit 1;

insert into comments (post_id, parent_id, author_name, author_handle, body, upvotes, created_at)
select p.id, c.id, 'Marcus Hale', 'mhale',
 'I am the one who walked it. The 1-beds are the 18%. Do not average them with the cousin unit.',
 19, now() - interval '5 hours'
from posts p
join comments c on c.post_id = p.id and c.author_handle = 'niao' and c.parent_id is null
where p.title like 'Inglewood Fourplex%' and p.kind = 'dd'
limit 1;

update posts
set comment_count = comment_count + 4
where title like 'Inglewood Fourplex%' and kind = 'dd';

insert into posts (
  community_id, author_name, author_handle, author_tier, title, body, kind,
  restack_of, upvotes, downvotes, comment_count, created_at
)
select c.id, 'Jonah Park', 'jpark', 'ground', p.title,
  'This is the diligence. Walk the building or sit down.',
  'restack', p.id, 96, 4, 3, now() - interval '80 minutes'
from posts p
join communities c on c.slug = 'the-pit'
where p.title like 'Inglewood Fourplex%' and p.kind = 'dd'
limit 1;

update posts
set restack_count = restack_count + 1
where title like 'Inglewood Fourplex%' and kind = 'dd';
