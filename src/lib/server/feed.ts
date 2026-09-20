import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { canAccess } from "@/lib/tiers";
import type {
  Comment,
  Community,
  Market,
  Post,
  SocialState,
  TrendingFloor,
  TrendingVoice,
  Vault,
} from "@/lib/types";
import { ensureProfile, notify } from "./me";

export const POST_SELECT = `
  p.id, p.community_id, c.slug as community_slug, c.name as community_name,
  p.user_id, p.author_name, p.author_handle, p.author_tier, p.title, p.body, p.kind,
  p.upvotes, p.downvotes, p.comment_count, p.created_at::text as created_at,
  p.restack_of, p.restack_count,
  rp.title as restack_title, rp.body as restack_body,
  rp.author_name as restack_author, rp.author_handle as restack_handle,
  rc.slug as restack_community_slug, rc.name as restack_community_name
`;

export const POST_FROM = `
  posts p
  join communities c on c.id = p.community_id
  left join posts rp on rp.id = p.restack_of
  left join communities rc on rc.id = rp.community_id
`;

function sortSql(sort: string) {
  if (sort === "new") return "p.created_at desc";
  if (sort === "top") return "(p.upvotes - p.downvotes) desc, p.created_at desc";
  return "(p.upvotes - p.downvotes)::float / power(extract(epoch from (now() - p.created_at))/3600.0 + 2, 1.4) desc";
}

export const listCommunities = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<Community>`select id, slug, name, description, category, min_tier, member_count, rules from communities order by member_count desc`;
});

export const getCommunity = createServerFn({ method: "GET" })
  .validator((d: { slug: string; sort?: string }) => ({ slug: d.slug, sort: d.sort ?? "hot" }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const community = (
      await sql<Community>`select id, slug, name, description, category, min_tier, member_count, rules from communities where slug = ${data.slug}`
    )[0];
    if (!community) return { community: null, posts: [] as Post[] };
    const order = sortSql(data.sort);
    const posts = await sql.query<Post>(
      `select ${POST_SELECT} from ${POST_FROM}
       where p.community_id = $1 order by ${order} limit 60`,
      [community.id],
    );
    return { community, posts };
  });

export const listFeed = createServerFn({ method: "GET" })
  .validator((d: { sort?: string; q?: string } | undefined) => ({
    sort: d?.sort ?? "hot",
    q: d?.q?.trim() ?? "",
  }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const order = sortSql(data.sort);
    if (data.q) {
      const like = `%${data.q}%`;
      return sql.query<Post>(
        `select ${POST_SELECT} from ${POST_FROM}
         where p.title ilike $1 or p.body ilike $1 or p.author_handle ilike $1 or p.author_name ilike $1
         order by ${order} limit 60`,
        [like],
      );
    }
    return sql.query<Post>(
      `select ${POST_SELECT} from ${POST_FROM}
       order by ${order} limit 60`,
      [],
    );
  });

export const listFollowing = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const order = sortSql("hot");
    return sql.query<Post>(
      `select ${POST_SELECT} from ${POST_FROM}
       where p.author_handle in (select handle from follows where follower_id = $1)
       order by ${order} limit 60`,
      [context.userId],
    );
  });

export const listSaved = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    return sql.query<Post>(
      `select ${POST_SELECT} from ${POST_FROM}
       join bookmarks b on b.post_id = p.id
       where b.user_id = $1
       order by b.created_at desc limit 60`,
      [context.userId],
    );
  });

export const getSocialState = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<SocialState> => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const following = await sql<{ handle: string }>`select handle from follows where follower_id = ${context.userId}`;
    const saved = await sql<{ post_id: number }>`select post_id from bookmarks where user_id = ${context.userId}`;
    const joined = await sql<{ community_id: number }>`select community_id from community_members where user_id = ${context.userId}`;
    const restacked = await sql<{ restack_of: number }>`
      select restack_of from posts
      where user_id = ${context.userId} and restack_of is not null`;
    return {
      following: following.map((r) => r.handle),
      saved: saved.map((r) => r.post_id),
      joined: joined.map((r) => r.community_id),
      restacked: restacked.map((r) => r.restack_of),
    };
  });

export const listTrending = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const floors = await sql<TrendingFloor>`
    select c.slug, c.name, c.member_count,
      coalesce((
        select sum(p.upvotes - p.downvotes)::int
        from posts p
        where p.community_id = c.id and p.created_at > now() - interval '3 days'
      ), 0) as heat
    from communities c
    order by heat desc, c.member_count desc
    limit 6`;
  const voices = await sql<TrendingVoice>`
    select author_handle as handle, max(author_name) as name, max(author_tier) as tier,
      sum(upvotes - downvotes)::int as score, count(*)::int as posts
    from posts
    group by author_handle
    order by score desc
    limit 8`;
  return { floors, voices };
});

export const searchHouse = createServerFn({ method: "GET" })
  .validator((d: { q: string }) => ({ q: d.q.trim().slice(0, 80) }))
  .handler(async ({ data }) => {
    if (!data.q) {
      return {
        posts: [] as Post[],
        vaults: [] as Pick<Vault, "id" | "slug" | "name" | "location" | "category">[],
        markets: [] as Pick<Market, "id" | "slug" | "question" | "yes_price" | "category">[],
        people: [] as { handle: string; name: string; tier: string }[],
      };
    }
    const sql = await getSql();
    const like = `%${data.q}%`;
    const posts = await sql.query<Post>(
      `select ${POST_SELECT} from ${POST_FROM}
       where p.title ilike $1 or p.body ilike $1 or p.author_handle ilike $1 or p.author_name ilike $1
       order by (p.upvotes - p.downvotes) desc limit 20`,
      [like],
    );
    const vaults = await sql.query<Pick<Vault, "id" | "slug" | "name" | "location" | "category">>(
      `select id, slug, name, location, category from vaults
       where name ilike $1 or location ilike $1 or description ilike $1 limit 8`,
      [like],
    );
    const markets = await sql.query<Pick<Market, "id" | "slug" | "question" | "yes_price" | "category">>(
      `select id, slug, question, yes_price, category from markets
       where question ilike $1 or description ilike $1 limit 8`,
      [like],
    );
    const people = await sql.query<{ handle: string; name: string; tier: string }>(
      `select author_handle as handle, max(author_name) as name, max(author_tier) as tier
       from posts
       where author_handle ilike $1 or author_name ilike $1
       group by author_handle
       limit 8`,
      [like],
    );
    return { posts, vaults, markets, people };
  });

export const getPost = createServerFn({ method: "GET" })
  .validator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const post = (
      await sql.query<Post>(`select ${POST_SELECT} from ${POST_FROM} where p.id = $1`, [data.id])
    )[0];
    if (!post) return { post: null, comments: [] as Comment[] };
    const comments = await sql<Comment>`
      select id, post_id, parent_id, user_id, author_name, author_handle, body, upvotes, created_at::text as created_at
      from comments where post_id = ${data.id} order by upvotes desc, created_at asc`;
    return { post, comments };
  });

export const createPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { communitySlug: string; title: string; body: string; kind?: string }) => d)
  .handler(async ({ context, data }) => {
    const title = data.title.trim().slice(0, 160);
    const body = data.body.trim().slice(0, 8000);
    if (!body) throw new Error("Write something.");
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    const community = (
      await sql<Community>`select id, slug, name, description, category, min_tier, member_count, rules from communities where slug = ${data.communitySlug}`
    )[0];
    if (!community) throw new Error("Unknown floor.");
    if (!canAccess(me.tier, community.min_tier)) {
      throw new Error(`This floor starts at ${community.min_tier}.`);
    }
    const kind = data.kind === "dd" || data.kind === "market" || data.kind === "deal" ? data.kind : "thread";
    const rows = await sql<{ id: number }>`
      insert into posts (community_id, user_id, author_name, author_handle, author_tier, title, body, kind, upvotes)
      values (${community.id}, ${context.userId}, ${me.display_name}, ${me.handle}, ${me.tier}, ${title}, ${body}, ${kind}, 1)
      returning id`;
    await sql`
      insert into votes (user_id, target_type, target_id, value)
      values (${context.userId}, 'post', ${rows[0]!.id}, 1)
      on conflict (user_id, target_type, target_id) do nothing`;
    await sql`update profiles set karma = karma + 1 where user_id = ${context.userId}`;
    return { id: rows[0]!.id };
  });

export const restackPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { postId: number }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    const original = (
      await sql.query<Post>(`select ${POST_SELECT} from ${POST_FROM} where p.id = $1`, [data.postId])
    )[0];
    if (!original) throw new Error("Post missing.");
    const sourceId = original.restack_of ?? original.id;
    const already = await sql<{ id: number }>`
      select id from posts where user_id = ${context.userId} and restack_of = ${sourceId} limit 1`;
    if (already[0]) {
      await sql`delete from posts where id = ${already[0].id} and user_id = ${context.userId}`;
      await sql`update posts set restack_count = greatest(restack_count - 1, 0) where id = ${sourceId}`;
      return { restacked: false };
    }
    const rows = await sql<{ id: number }>`
      insert into posts (
        community_id, user_id, author_name, author_handle, author_tier,
        title, body, kind, restack_of, upvotes
      )
      values (
        ${original.community_id}, ${context.userId}, ${me.display_name}, ${me.handle}, ${me.tier},
        ${original.title}, ${""}, 'restack', ${sourceId}, 1
      )
      returning id`;
    await sql`update posts set restack_count = restack_count + 1 where id = ${sourceId}`;
    if (original.user_id && original.user_id !== context.userId) {
      await notify(
        sql,
        original.user_id,
        "restack",
        `${me.display_name} restacked you`,
        original.title || "Your post is on more tapes.",
        `/post/${rows[0]!.id}`,
      );
    }
    await sql`
      insert into votes (user_id, target_type, target_id, value)
      values (${context.userId}, 'post', ${rows[0]!.id}, 1)
      on conflict (user_id, target_type, target_id) do nothing`;
    return { restacked: true, id: rows[0]!.id };
  });

export const createComment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { postId: number; body: string; parentId?: number | null }) => d)
  .handler(async ({ context, data }) => {
    const body = data.body.trim().slice(0, 4000);
    if (!body) throw new Error("Write a comment.");
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    const post = (
      await sql<{ id: number; user_id: string | null; title: string }>`
        select id, user_id, title from posts where id = ${data.postId}`
    )[0];
    if (!post) throw new Error("Post missing.");
    await sql`
      insert into comments (post_id, parent_id, user_id, author_name, author_handle, body)
      values (${data.postId}, ${data.parentId ?? null}, ${context.userId}, ${me.display_name}, ${me.handle}, ${body})`;
    await sql`update posts set comment_count = comment_count + 1 where id = ${data.postId}`;
    if (post.user_id && post.user_id !== context.userId) {
      await notify(
        sql,
        post.user_id,
        "comment",
        `${me.display_name} replied on the tape`,
        body.slice(0, 180),
        `/post/${data.postId}`,
      );
    }
    if (data.parentId) {
      const parent = (
        await sql<{ user_id: string | null }>`select user_id from comments where id = ${data.parentId}`
      )[0];
      if (parent?.user_id && parent.user_id !== context.userId && parent.user_id !== post.user_id) {
        await notify(
          sql,
          parent.user_id,
          "comment",
          `${me.display_name} replied to you`,
          body.slice(0, 180),
          `/post/${data.postId}`,
        );
      }
    }
    return { ok: true };
  });

export const vote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { targetType: "post" | "comment"; targetId: number; value: 1 | -1 }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const existing = await sql<{ value: number }>`
      select value from votes
      where user_id = ${context.userId} and target_type = ${data.targetType} and target_id = ${data.targetId}`;
    const prev = existing[0]?.value ?? 0;
    const next = prev === data.value ? 0 : data.value;
    if (next === 0) {
      await sql`delete from votes where user_id = ${context.userId} and target_type = ${data.targetType} and target_id = ${data.targetId}`;
    } else if (prev === 0) {
      await sql`insert into votes (user_id, target_type, target_id, value) values (${context.userId}, ${data.targetType}, ${data.targetId}, ${next})`;
    } else {
      await sql`update votes set value = ${next} where user_id = ${context.userId} and target_type = ${data.targetType} and target_id = ${data.targetId}`;
    }
    const deltaUp = (next === 1 ? 1 : 0) - (prev === 1 ? 1 : 0);
    const deltaDown = (next === -1 ? 1 : 0) - (prev === -1 ? 1 : 0);
    if (data.targetType === "post") {
      await sql`update posts set upvotes = upvotes + ${deltaUp}, downvotes = downvotes + ${deltaDown} where id = ${data.targetId}`;
    } else {
      await sql`update comments set upvotes = upvotes + ${deltaUp} where id = ${data.targetId}`;
    }
    return { value: next };
  });

export const myVotes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ target_type: string; target_id: number; value: number }>`
      select target_type, target_id, value from votes where user_id = ${context.userId}`;
  });

export const toggleBookmark = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { postId: number }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const existing = await sql<{ n: number }>`select 1 as n from bookmarks where user_id = ${context.userId} and post_id = ${data.postId}`;
    if (existing.length) {
      await sql`delete from bookmarks where user_id = ${context.userId} and post_id = ${data.postId}`;
      return { saved: false };
    }
    await sql`insert into bookmarks (user_id, post_id) values (${context.userId}, ${data.postId})`;
    return { saved: true };
  });

export const joinCommunity = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { communityId: number }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    const community = (
      await sql<Community>`select id, slug, name, description, category, min_tier, member_count, rules from communities where id = ${data.communityId}`
    )[0];
    if (!community) throw new Error("Unknown floor.");
    if (!canAccess(me.tier, community.min_tier)) throw new Error("Your membership does not open this floor yet.");
    const existing = await sql<{ n: number }>`select 1 as n from community_members where user_id = ${context.userId} and community_id = ${data.communityId}`;
    if (existing.length) {
      await sql`delete from community_members where user_id = ${context.userId} and community_id = ${data.communityId}`;
      await sql`update communities set member_count = greatest(member_count - 1, 0) where id = ${data.communityId}`;
      return { joined: false };
    }
    await sql`insert into community_members (user_id, community_id) values (${context.userId}, ${data.communityId})`;
    await sql`update communities set member_count = member_count + 1 where id = ${data.communityId}`;
    return { joined: true };
  });
