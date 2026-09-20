import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Listing } from "@/lib/types";
import { ensureProfile } from "./me";

export const listListings = createServerFn({ method: "GET" })
  .validator((d: { category?: string } | undefined) => ({ category: d?.category ?? "" }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    if (data.category) {
      return sql<Listing>`
        select id, seller_user_id, seller_name, seller_handle, title, description, category,
          price_cents, location, status, art_key, created_at::text as created_at
        from listings where category = ${data.category} order by created_at desc`;
    }
    return sql<Listing>`
      select id, seller_user_id, seller_name, seller_handle, title, description, category,
        price_cents, location, status, art_key, created_at::text as created_at
      from listings order by created_at desc`;
  });

export const buyListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { listingId: number }) => d)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    const listing = (
      await sql<Listing>`
        select id, seller_user_id, seller_name, seller_handle, title, description, category,
          price_cents, location, status, art_key, created_at::text as created_at
        from listings where id = ${data.listingId}`
    )[0];
    if (!listing) throw new Error("Listing missing.");
    if (listing.status !== "open") throw new Error("Already spoken for.");
    if (listing.price_cents <= 0) {
      await sql`update listings set status = 'intro' where id = ${listing.id} and status = 'open'`;
      await sql`
        insert into listing_orders (listing_id, buyer_id, amount_cents)
        values (${listing.id}, ${context.userId}, 0)`;
      await sql`
        insert into notifications (user_id, kind, title, body, href)
        values (${context.userId}, 'bazaar', 'Intro requested.', ${`The Floor will pass your name to ${listing.seller_name} on “${listing.title}.”`}, '/bazaar')`;
      return { ok: true, intro: true };
    }
    if (me.cash_cents < listing.price_cents) throw new Error("Not enough buying power.");
    await sql`update listings set status = 'sold' where id = ${listing.id} and status = 'open'`;
    await sql`update profiles set cash_cents = cash_cents - ${listing.price_cents} where user_id = ${context.userId}`;
    await sql`
      insert into listing_orders (listing_id, buyer_id, amount_cents)
      values (${listing.id}, ${context.userId}, ${listing.price_cents})`;
    await sql`
      insert into notifications (user_id, kind, title, body, href)
      values (${context.userId}, 'bazaar', 'Bazaar purchase.', ${`You acquired “${listing.title}.”`}, '/portfolio')`;
    return { ok: true, intro: false };
  });

export const createListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((d: { title: string; description: string; category: string; priceCents: number; location: string }) => d)
  .handler(async ({ context, data }) => {
    const title = data.title.trim().slice(0, 120);
    const description = data.description.trim().slice(0, 2000);
    if (!title || !description) throw new Error("Title and description required.");
    const sql = await getSql();
    const me = await ensureProfile(sql, context.userId);
    const category = ["secondary", "vehicles", "services", "deals", "goods"].includes(data.category)
      ? data.category
      : "goods";
    const art =
      category === "vehicles" ? "van" : category === "secondary" ? "paper" : category === "deals" ? "deal" : "service";
    await sql`
      insert into listings (seller_user_id, seller_name, seller_handle, title, description, category, price_cents, location, art_key)
      values (${context.userId}, ${me.display_name}, ${me.handle}, ${title}, ${description}, ${category}, ${Math.max(0, Math.round(data.priceCents))}, ${data.location.slice(0, 80)}, ${art})`;
    return { ok: true };
  });
