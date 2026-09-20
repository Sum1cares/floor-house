import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { canAccess, computeTier } from "@/lib/tiers";
import type { BenefitClaim, MarketPosition, Vault, VaultPosition } from "@/lib/types";
import { ensureProfile } from "./me";

export const listVaults = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<Vault>`
    select id, slug, name, category, location, description, thesis, risk,
      target_cents, raised_cents, yield_bps, min_tier, min_check_cents, status,
      members, art_key, hold_years
    from vaults order by (raised_cents::float / nullif(target_cents, 0)) desc`;
});

export const getVault = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const vault = (
      await sql<Vault>`
        select id, slug, name, category, location, description, thesis, risk,
          target_cents, raised_cents, yield_bps, min_tier, min_check_cents, status,
          members, art_key, hold_years
        from vaults where slug = ${data.slug}`
    )[0];
    if (!vault) return { vault: null, distributions: [], relatedMarkets: [] };
    const distributions = await sql<{ id: number; label: string; amount_cents: number; occurred_on: string }>`
      select id, label, amount_cents, occurred_on::text as occurred_on
      from distributions where vault_id = ${vault.id} order by occurred_on desc`;
    const relatedMarkets = await sql<{ id: number; slug: string; question: string; yes_price: number }>`
      select id, slug, question, yes_price from markets where related_vault_id = ${vault.id}`;
    return { vault, distributions, relatedMarkets };
  });

export const investInVault = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { vaultId: number; amountCents: number }) => d)
  .handler(async ({ context, data }) => {
    const amount = Math.round(data.amountCents);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter an amount.");
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    const vault = (
      await sql<Vault>`
        select id, slug, name, category, location, description, thesis, risk,
          target_cents, raised_cents, yield_bps, min_tier, min_check_cents, status,
          members, art_key, hold_years
        from vaults where id = ${data.vaultId}`
    )[0];
    if (!vault) throw new Error("Vault missing.");
    if (vault.status !== "open") throw new Error("This vault is closed.");
    if (!canAccess(me.tier, vault.min_tier)) {
      throw new Error(`This vault opens at ${vault.min_tier} membership.`);
    }
    if (amount < vault.min_check_cents) {
      throw new Error(`Minimum check is ${(vault.min_check_cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}.`);
    }
    if (me.cash_cents < amount) throw new Error("Not enough buying power.");
    const remaining = vault.target_cents - vault.raised_cents;
    if (amount > remaining) throw new Error("That check overfills the vault.");

    const existing = await sql<{ amount_cents: number }>`
      select amount_cents from vault_positions where user_id = ${context.userId} and vault_id = ${vault.id}`;
    if (existing[0]) {
      await sql`update vault_positions set amount_cents = amount_cents + ${amount} where user_id = ${context.userId} and vault_id = ${vault.id}`;
    } else {
      await sql`insert into vault_positions (user_id, vault_id, amount_cents) values (${context.userId}, ${vault.id}, ${amount})`;
      await sql`update vaults set members = members + 1 where id = ${vault.id}`;
    }
    const contributed = me.contributed_cents + amount;
    const tier = computeTier(me.income_band, contributed);
    await sql`
      update profiles
      set cash_cents = cash_cents - ${amount}, contributed_cents = ${contributed}, tier = ${tier}
      where user_id = ${context.userId}`;
    await sql`update vaults set raised_cents = raised_cents + ${amount} where id = ${vault.id}`;
    await sql`
      insert into notifications (user_id, kind, title, body, href)
      values (${context.userId}, 'invest', 'Capital deployed.', ${`You put $${(amount / 100).toLocaleString("en-US")} into ${vault.name}.`}, ${`/vaults/${vault.slug}`})`;
    return { ok: true, tier };
  });

export const getPortfolio = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profile = await ensureProfile(sql, context.userId);
    const vaults = await sql<VaultPosition>`
      select v.id as vault_id, v.slug, v.name, v.category, p.amount_cents, v.yield_bps, v.art_key
      from vault_positions p join vaults v on v.id = p.vault_id
      where p.user_id = ${context.userId}
      order by p.amount_cents desc`;
    const markets = await sql<MarketPosition>`
      select m.id as market_id, m.question, p.side, p.shares, p.avg_price, p.amount_cents, m.yes_price
      from market_positions p join markets m on m.id = p.market_id
      where p.user_id = ${context.userId}
      order by p.created_at desc`;
    const orders = await sql<{ id: number; title: string; amount_cents: number; created_at: string }>`
      select o.id, l.title, o.amount_cents, o.created_at::text as created_at
      from listing_orders o join listings l on l.id = o.listing_id
      where o.buyer_id = ${context.userId}
      order by o.created_at desc`;
    const commons = await sql<BenefitClaim>`
      select b.id as benefit_id, b.slug, b.name, b.category, b.art_key, b.location,
        c.created_at::text as created_at
      from benefit_claims c join benefits b on b.id = c.benefit_id
      where c.user_id = ${context.userId}
      order by c.created_at desc`;
    return { profile, vaults, markets, orders, commons };
  });
