import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Post, Profile } from "@/lib/types";
import { POST_FROM, POST_SELECT } from "./feed";
import { ensureProfile, notify } from "./me";

export const getMember = createServerFn({ method: "GET" })
  .validator((d: { handle: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const handle = data.handle.toLowerCase();
    const profile = (
      await sql<Profile>`
        select user_id, handle, display_name, bio, income_band, tier, karma, cash_cents, contributed_cents, brought, created_at::text as created_at
        from profiles where handle = ${handle}`
    )[0];
    const posts = await sql.query<Post>(
      `select ${POST_SELECT} from ${POST_FROM}
       where p.author_handle = $1
       order by p.created_at desc limit 30`,
      [handle],
    );
    const followers = await sql<{ c: number }>`select count(*)::int as c from follows where handle = ${handle}`;
    const following = profile
      ? await sql<{ c: number }>`select count(*)::int as c from follows where follower_id = ${profile.user_id}`
      : [{ c: 0 }];
    const counts = { followers: followers[0]?.c ?? 0, following: following[0]?.c ?? 0 };
    if (profile) {
      return { kind: "member" as const, profile, posts, ...counts };
    }
    if (!posts[0]) return { kind: "missing" as const, profile: null, posts: [], ...counts };
    const first = posts[0];
    return {
      kind: "floor" as const,
      profile: {
        user_id: "",
        handle: first.author_handle,
        display_name: first.author_name,
        bio: "A voice on the Floor. Account lives in the tape.",
        income_band: "open",
        tier: first.author_tier,
        karma: posts.reduce((s, p) => s + p.upvotes - p.downvotes, 0),
        cash_cents: 0,
        contributed_cents: 0,
        brought: 0,
        created_at: first.created_at,
      } satisfies Profile,
      posts,
      ...counts,
    };
  });

export const toggleFollow = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { handle: string }) => ({
    handle: d.handle.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20),
  }))
  .handler(async ({ context, data }) => {
    if (!data.handle) throw new Error("Missing handle.");
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    if (me.handle === data.handle) throw new Error("You already live here.");
    const existing = await sql<{ n: number }>`
      select 1 as n from follows where follower_id = ${context.userId} and handle = ${data.handle}`;
    if (existing.length) {
      await sql`delete from follows where follower_id = ${context.userId} and handle = ${data.handle}`;
      return { following: false };
    }
    await sql`insert into follows (follower_id, handle) values (${context.userId}, ${data.handle})`;
    const target = (
      await sql<{ user_id: string }>`select user_id from profiles where handle = ${data.handle}`
    )[0];
    if (target && target.user_id !== context.userId) {
      await notify(
        sql,
        target.user_id,
        "follow",
        `${me.display_name} followed you`,
        "A member is watching your tape.",
        `/u/${me.handle}`,
      );
    }
    return { following: true };
  });
