import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { VaultArt } from "@/components/vault-art";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { toastErr } from "@/lib/errors";
import { buyListing, createListing, listListings } from "@/lib/server/bazaar";
import { CATEGORY_LABEL } from "@/lib/tiers";
import { cn, dollars } from "@/lib/utils";

export const Route = createFileRoute("/_app/bazaar")({
  loader: () => listListings({ data: { category: "" } }),
  component: BazaarPage,
});

function BazaarPage() {
  const user = useCurrentUser();
  const qc = useQueryClient();
  const [cat, setCat] = useState("");
  const [open, setOpen] = useState(false);
  const initial = Route.useLoaderData();
  const q = useQuery({
    queryKey: ["listings", cat],
    queryFn: () => listListings({ data: { category: cat } }),
    initialData: cat === "" ? initial : undefined,
  });
  const buy = useMutation({
    mutationFn: (listingId: number) => buyListing({ data: { listingId } }),
    onSuccess: (res) => {
      toast.success(res.intro ? "Intro requested." : "Acquired.");
      void qc.invalidateQueries({ queryKey: ["listings"] });
      void qc.invalidateQueries({ queryKey: ["me"] });
      void qc.invalidateQueries({ queryKey: ["portfolio"] });
    },
    onError: toastErr,
  });
  const cats = ["", "secondary", "vehicles", "services", "deals", "goods"];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.22em] text-subtle uppercase">Members’ market</p>
          <h1 className="font-display text-4xl tracking-tight">Bazaar</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Secondaries, vans off the tour, counsel, off-market intros. Facebook Marketplace energy,
            membership-gated.
          </p>
        </div>
        {user ? (
          <Button onClick={() => setOpen(true)}>List something</Button>
        ) : null}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c || "all"}
            type="button"
            onClick={() => setCat(c)}
            className={cn(
              "h-9 rounded-full px-3 text-xs font-medium hairline",
              cat === c ? "bg-accent text-accent-fg" : "text-muted hover:text-fg",
            )}
          >
            {c ? CATEGORY_LABEL[c] ?? c : "All"}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {q.isPending && !q.data
          ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-3xl" />)
          : (q.data ?? []).map((l) => (
              <article key={l.id} className="overflow-hidden rounded-3xl bg-surface hairline">
                <VaultArt artKey={l.art_key} className="h-36" />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge>{CATEGORY_LABEL[l.category] ?? l.category}</Badge>
                    <span className="text-xs text-subtle">{l.location}</span>
                  </div>
                  <h2 className="mt-2 font-display text-xl tracking-tight">{l.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{l.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="tabular text-sm">
                      {l.price_cents > 0 ? dollars(l.price_cents) : "Intro"}
                    </span>
                    {l.status !== "open" ? (
                      <span className="text-xs text-subtle capitalize">{l.status}</span>
                    ) : user ? (
                      <Button size="sm" disabled={buy.isPending} onClick={() => buy.mutate(l.id)}>
                        {l.price_cents > 0 ? "Buy" : "Request intro"}
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => signIn(GROK_PROVIDERS[0]!.providerId)}>
                        Sign in
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-subtle">@{l.seller_handle}</p>
                </div>
              </article>
            ))}
      </div>
      <ListDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function ListDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("goods");
  const [price, setPrice] = useState("0");
  const [location, setLocation] = useState("");
  const mut = useMutation({
    mutationFn: () =>
      createListing({
        data: {
          title,
          description,
          category,
          priceCents: Math.round(Number(price) * 100) || 0,
          location,
        },
      }),
    onSuccess: () => {
      toast.success("Listed.");
      onOpenChange(false);
      void qc.invalidateQueries({ queryKey: ["listings"] });
    },
    onError: toastErr,
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>List on the bazaar</DialogTitle>
        <DialogDescription>Secondaries, services, vehicles, or an intro.</DialogDescription>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
        >
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea placeholder="What is it, really?" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <div className="grid grid-cols-2 gap-2">
            <select
              className="h-11 rounded-lg bg-elevated px-3 text-sm hairline"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="secondary">Secondaries</option>
              <option value="vehicles">Vehicles</option>
              <option value="services">Services</option>
              <option value="deals">Deal flow</option>
              <option value="goods">Goods</option>
            </select>
            <Input placeholder="Price USD (0 = intro)" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <div className="flex justify-end">
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? "Listing…" : "Publish"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
