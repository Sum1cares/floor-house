import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { computeTier, type IncomeBandId } from "@/lib/tiers";
import type { Notification, Profile } from "@/lib/types";

type Sql = Awaited<ReturnType<typeof getSql>>;

const PROFILE_SELECT = `
  user_id, handle, display_name, bio, income_band, tier, karma, cash_cents,
  contributed_cents, brought, created_at::text as created_at
`;

function handleFrom(name?: string | null, email?: string | null, userId?: string) {
  const raw = (name || email?.split("@")[0] || "member")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 14);
  const base = raw || "member";
  const tail = (userId ?? "").replace(/[^a-z0-9]/gi, "").slice(-4).toLowerCase();
  return tail ? `${base}${tail}` : base;
}

export async function notify(
  sql: Sql,
  userId: string,
  kind: string,
  title: string,
  body: string,
  href: string,
) {
  await sql`
    insert into notifications (user_id, kind, title, body, href)
    values (${userId}, ${kind}, ${title}, ${body}, ${href})`;
}

export async function ensureProfile(
  sql: Sql,
  userId: string,
  name?: string | null,
  email?: string | null,
): Promise<Profile> {
  const existing = await sql.query<Profile>(
    `select ${PROFILE_SELECT} from profiles where user_id = $1`,
    [userId],
  );
  if (existing[0]) return existing[0];

  const display = (name && name.trim()) || email?.split("@")[0] || "Member";
  let handle = handleFrom(name, email, userId);
  for (let i = 0; i < 8; i += 1) {
    const clash = await sql<{ n: number }>`select 1 as n from profiles where handle = ${handle} limit 1`;
    if (!clash.length) break;
    handle = `${handleFrom(name, email)}${i + 2}`;
  }

  await sql`
    insert into profiles (user_id, handle, display_name, cash_cents)
    values (${userId}, ${handle}, ${display}, 2500000)`;
  await sql`update house set member_count = member_count + 1 where id = 1`;

  await sql`
    insert into notifications (user_id, kind, title, body, href)
    values
      (${userId}, 'welcome', 'You have a floor.', 'Ground membership is live. $25,000 in commons buying power is waiting — deploy it, or just read the tape.', '/membership'),
      (${userId}, 'deal', 'Street-to-Suite is still open.', 'The commons fund is the on-ramp. Twenty-five dollars is a real share.', '/vaults/street-to-suite'),
      (${userId}, 'commons', 'The Commons counts you.', 'House cars, crash pads, donated nights. They unlock when the house grows. Bring someone.', '/commons')`;

  const created = await sql.query<Profile>(
    `select ${PROFILE_SELECT} from profiles where user_id = $1`,
    [userId],
  );
  return created[0]!;
}

export const getMe = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { name?: string | null; email?: string | null } | undefined) => d ?? {})
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const profile = await ensureProfile(sql, context.userId, data.name, data.email);
    const unread = await sql<{ c: number }>`
      select count(*)::int as c from notifications where user_id = ${context.userId} and read = false`;
    return { profile, unread: unread[0]?.c ?? 0 };
  });

export const updateMe = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { display_name?: string; bio?: string; handle?: string; income_band?: string }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    const display = (data.display_name ?? me.display_name).trim().slice(0, 48) || me.display_name;
    const bio = (data.bio ?? me.bio).slice(0, 280);
    let handle = me.handle;
    if (data.handle) {
      const next = data.handle.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
      if (next && next !== me.handle) {
        const clash = await sql<{ n: number }>`select 1 as n from profiles where handle = ${next} and user_id <> ${context.userId} limit 1`;
        if (clash.length) throw new Error("That handle is taken.");
        handle = next;
      }
    }
    const income = (data.income_band ?? me.income_band) as IncomeBandId;
    const tier = computeTier(income, me.contributed_cents);
    await sql`
      update profiles
      set display_name = ${display}, bio = ${bio}, handle = ${handle}, income_band = ${income}, tier = ${tier}
      where user_id = ${context.userId}`;
    const rows = await sql.query<Profile>(
      `select ${PROFILE_SELECT} from profiles where user_id = $1`,
      [context.userId],
    );
    return rows[0]!;
  });

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    return sql<Notification>`
      select id, kind, title, body, href, read, created_at::text as created_at
      from notifications where user_id = ${context.userId}
      order by created_at desc limit 40`;
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`update notifications set read = true where user_id = ${context.userId}`;
    return { ok: true };
  });

export const deleteMe = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const id = context.userId;
    await sql`delete from votes where user_id = ${id}`;
    await sql`delete from bookmarks where user_id = ${id}`;
    await sql`delete from follows where follower_id = ${id}`;
    await sql`delete from notifications where user_id = ${id}`;
    await sql`delete from vault_positions where user_id = ${id}`;
    await sql`delete from market_positions where user_id = ${id}`;
    await sql`delete from listing_orders where buyer_id = ${id}`;
    await sql`delete from benefit_claims where user_id = ${id}`;
    await sql`delete from recruits where inviter_id = ${id}`;
    await sql`delete from community_members where user_id = ${id}`;
    await sql`
      update posts
      set user_id = null, author_name = 'Former member', author_handle = 'departed'
      where user_id = ${id}`;
    await sql`
      update comments
      set user_id = null, author_name = 'Former member', author_handle = 'departed'
      where user_id = ${id}`;
    await sql`
      update listings
      set seller_user_id = null, seller_name = 'Former member', seller_handle = 'departed'
      where seller_user_id = ${id}`;
    const gone = await sql`delete from profiles where user_id = ${id} returning user_id`;
    if (gone.length) {
      await sql`update house set member_count = greatest(member_count - 1, 0) where id = 1`;
    }
    await sql.query(`delete from "session" where "userId" = $1`, [id]);
    await sql.query(`delete from "account" where "userId" = $1`, [id]);
    await sql.query(`delete from "user" where "id" = $1`, [id]);
    return { ok: true as const };
  });
