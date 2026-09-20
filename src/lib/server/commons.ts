import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { BRING_CAP } from "@/lib/commons";
import { getSql } from "@/lib/db";
import type { Benefit, House } from "@/lib/types";
import { ensureProfile } from "./me";

export const listCommons = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const house = (
    await sql<House>`select id, member_count from house where id = 1`
  )[0] ?? { id: 1, member_count: 0 };
  const benefits = await sql<Benefit>`
    select id, slug, name, category, description, sponsor, location, unlock_at, capacity,
      claimed, art_key, cadence, terms
    from benefits order by unlock_at asc, id asc`;
  return { house, benefits };
});

export const getBenefit = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const house = (
      await sql<House>`select id, member_count from house where id = 1`
    )[0] ?? { id: 1, member_count: 0 };
    const benefit = (
      await sql<Benefit>`
        select id, slug, name, category, description, sponsor, location, unlock_at, capacity,
          claimed, art_key, cadence, terms
        from benefits where slug = ${data.slug}`
    )[0];
    const ladder = await sql<Benefit>`
      select id, slug, name, category, description, sponsor, location, unlock_at, capacity,
        claimed, art_key, cadence, terms
      from benefits order by unlock_at asc`;
    return { house, benefit: benefit ?? null, ladder };
  });

export const myBenefitClaims = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureProfile(sql, context.userId);
    const ids = await sql<{ benefit_id: number }>`
      select benefit_id from benefit_claims where user_id = ${context.userId}`;
    const recruits = await sql<{ id: number; name: string; created_at: string }>`
      select id, name, created_at::text as created_at
      from recruits where inviter_id = ${context.userId}
      order by created_at desc limit 40`;
    return { ids: ids.map((r) => r.benefit_id), recruits };
  });

export const claimBenefit = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { benefitId: number }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    const house = (
      await sql<House>`select id, member_count from house where id = 1`
    )[0];
    const benefit = (
      await sql<Benefit>`
        select id, slug, name, category, description, sponsor, location, unlock_at, capacity,
          claimed, art_key, cadence, terms
        from benefits where id = ${data.benefitId}`
    )[0];
    if (!house || !benefit) throw new Error("Missing perk.");
    if (house.member_count < benefit.unlock_at) {
      const need = benefit.unlock_at - house.member_count;
      throw new Error(`Still locked. ${need.toLocaleString("en-US")} more members unlock it for everyone.`);
    }
    const existing = await sql<{ n: number }>`
      select 1 as n from benefit_claims where user_id = ${context.userId} and benefit_id = ${benefit.id}`;
    if (existing.length) {
      await sql`delete from benefit_claims where user_id = ${context.userId} and benefit_id = ${benefit.id}`;
      await sql`update benefits set claimed = greatest(claimed - 1, 0) where id = ${benefit.id}`;
      return { claimed: false };
    }
    if (benefit.capacity > 0 && benefit.claimed >= benefit.capacity) {
      throw new Error("No slots left on this perk. Bring members — the house bargains for more.");
    }
    await sql`insert into benefit_claims (user_id, benefit_id) values (${context.userId}, ${benefit.id})`;
    await sql`update benefits set claimed = claimed + 1 where id = ${benefit.id}`;
    await sql`
      insert into notifications (user_id, kind, title, body, href)
      values (
        ${context.userId},
        'commons',
        ${`You're on ${benefit.name}.`},
        ${benefit.capacity > 0 ? "A donated slot is in your name. Treat it like it was lent." : "Standing perk. The house already paid in members."},
        ${`/commons/${benefit.slug}`}
      )`;
    return { claimed: true, handle: me.handle };
  });

export const bringMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { name: string }) => d)
  .handler(async ({ context, data }) => {
    const name = data.name.trim().slice(0, 48);
    if (name.length < 2) throw new Error("Name the person you are bringing.");
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    if (me.brought >= BRING_CAP) {
      throw new Error(`Cap is ${BRING_CAP} on your roll for now. Share the invite for the rest.`);
    }
    const before = (
      await sql<House>`select id, member_count from house where id = 1`
    )[0];
    if (!before) throw new Error("House is not open.");
    await sql`insert into recruits (inviter_id, name) values (${context.userId}, ${name})`;
    await sql`update profiles set brought = brought + 1 where user_id = ${context.userId}`;
    await sql`update house set member_count = member_count + 1 where id = 1`;
    const afterCount = before.member_count + 1;
    const unlocked = await sql<Benefit>`
      select id, slug, name, category, description, sponsor, location, unlock_at, capacity,
        claimed, art_key, cadence, terms
      from benefits
      where unlock_at > ${before.member_count} and unlock_at <= ${afterCount}
      order by unlock_at asc`;
    if (unlocked[0]) {
      const perk = unlocked[0];
      await sql`
        insert into notifications (user_id, kind, title, body, href)
        values (
          ${context.userId},
          'unlock',
          ${`${perk.name} just opened.`},
          ${`The house crossed ${perk.unlock_at.toLocaleString("en-US")} because you brought someone. The perk is everyone's.`},
          ${`/commons/${perk.slug}`}
        )`;
    }
    return {
      memberCount: afterCount,
      brought: me.brought + 1,
      unlocked: unlocked.map((b) => ({ slug: b.slug, name: b.name })),
    };
  });
