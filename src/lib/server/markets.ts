import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Market } from "@/lib/types";
import { ensureProfile } from "./me";

export const listMarkets = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<Market>`
    select id, slug, question, description, category, yes_price, volume_cents, traders,
      closes_at::text as closes_at, status, related_vault_id
    from markets order by volume_cents desc`;
});

export const getMarket = createServerFn({ method: "GET" })
  .validator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const market = (
      await sql<Market>`
        select id, slug, question, description, category, yes_price, volume_cents, traders,
          closes_at::text as closes_at, status, related_vault_id
        from markets where slug = ${data.slug}`
    )[0];
    return market ?? null;
  });

export const tradeMarket = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { marketId: number; side: "yes" | "no"; amountCents: number }) => d)
  .handler(async ({ context, data }) => {
    const amount = Math.round(data.amountCents);
    if (!Number.isFinite(amount) || amount < 100) throw new Error("Minimum trade is $1.");
    if (data.side !== "yes" && data.side !== "no") throw new Error("Pick a side.");
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    if (me.cash_cents < amount) throw new Error("Not enough buying power.");
    const market = (
      await sql<Market>`
        select id, slug, question, description, category, yes_price, volume_cents, traders,
          closes_at::text as closes_at, status, related_vault_id
        from markets where id = ${data.marketId}`
    )[0];
    if (!market || market.status !== "open") throw new Error("Market closed.");

    const price = data.side === "yes" ? market.yes_price : 100 - market.yes_price;
    const shares = Math.max(1, Math.round(amount / Math.max(price, 1)));
    const shift = Math.min(8, Math.max(1, Math.round(shares / 40)));
    const nextYes =
      data.side === "yes"
        ? Math.min(95, market.yes_price + shift)
        : Math.max(5, market.yes_price - shift);

    const existing = await sql<{ id: number; shares: number; amount_cents: number }>`
      select id, shares, amount_cents from market_positions
      where user_id = ${context.userId} and market_id = ${market.id} and side = ${data.side}`;
    if (existing[0]) {
      const totalAmt = existing[0].amount_cents + amount;
      const totalShares = existing[0].shares + shares;
      const avg = Math.round(totalAmt / totalShares);
      await sql`update market_positions set shares = ${totalShares}, amount_cents = ${totalAmt}, avg_price = ${avg} where id = ${existing[0].id}`;
    } else {
      await sql`
        insert into market_positions (user_id, market_id, side, shares, avg_price, amount_cents)
        values (${context.userId}, ${market.id}, ${data.side}, ${shares}, ${price}, ${amount})`;
      await sql`update markets set traders = traders + 1 where id = ${market.id}`;
    }
    await sql`update profiles set cash_cents = cash_cents - ${amount} where user_id = ${context.userId}`;
    await sql`update markets set yes_price = ${nextYes}, volume_cents = volume_cents + ${amount} where id = ${market.id}`;
    return { shares, price: nextYes };
  });
