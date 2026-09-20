import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  Bookmark,
  Briefcase,
  Handshake,
  Landmark,
  Layers,
  Menu,
  Newspaper,
  PenLine,
  Search,
  Store,
  UserRound,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Wordmark } from "@/components/brand";
import { ComposeDialog } from "@/components/compose";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { GROK_PROVIDERS, authEnabled, signIn, signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listNotifications, markNotificationsRead } from "@/lib/server/me";
import { TIERS, type TierId } from "@/lib/tiers";
import { useProfile } from "@/lib/use-profile";
import { cn, compactDollars, relativeTime } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Feed", icon: Newspaper, exact: true },
  { to: "/floors", label: "Floors", icon: Layers },
  { to: "/vaults", label: "Vaults", icon: Landmark },
  { to: "/markets", label: "Markets", icon: Activity },
  { to: "/bazaar", label: "Bazaar", icon: Store },
  { to: "/commons", label: "Commons", icon: Handshake },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
] as const;

function NavLink({
  to,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  to: string;
  label: string;
  icon: typeof Newspaper;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition-colors hover:bg-elevated hover:text-fg",
        active && "bg-elevated text-fg",
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <div className="size-9 animate-pulse rounded-full bg-elevated" />;
  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm">Join the Floor</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {GROK_PROVIDERS.map((p) => (
            <DropdownMenuItem key={p.providerId} onSelect={() => signIn(p.providerId, { callbackURL: "/" })}>
              Continue with {p.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="rounded-full">
          <Avatar name={user.displayName ?? "Member"} src={user.profileImageUrl} size="sm" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/membership">Membership</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/portfolio">Portfolio</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/saved">Saved</Link>
        </DropdownMenuItem>
        {authEnabled ? (
          <DropdownMenuItem
            onSelect={() => {
              void signOut().catch(() => undefined);
            }}
          >
            Sign out
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Notifications() {
  const { user } = useCurrentUserState();
  const { data } = useProfile();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["notifications"],
    queryFn: () => listNotifications(),
    enabled: Boolean(user) && open,
  });
  const mark = useMutation({
    mutationFn: () => markNotificationsRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["me"] });
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
  if (!user) return null;
  const unread = data?.unread ?? 0;
  return (
    <>
      <button
        type="button"
        className="relative grid size-11 place-items-center rounded-lg text-muted hover:bg-elevated hover:text-fg"
        aria-label="Notifications"
        onClick={() => {
          setOpen(true);
          if (unread) mark.mutate();
        }}
      >
        <Bell className="size-4" />
        {unread > 0 ? (
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-accent" />
        ) : null}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="flex flex-col p-6">
          <SheetTitle className="pr-8">Notifications</SheetTitle>
          <div className="mt-6 flex-1 space-y-3 overflow-y-auto">
            {(list.data ?? []).length === 0 ? (
              <p className="text-sm text-muted">The tape is quiet.</p>
            ) : (
              (list.data ?? []).map((n) => (
                <a
                  key={n.id}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl bg-elevated p-3 hairline"
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{n.body}</p>
                  <p className="mt-2 text-xs text-subtle">{relativeTime(n.created_at)}</p>
                </a>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [compose, setCompose] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const { user } = useCurrentUserState();
  const { data } = useProfile();
  const profile = data?.profile;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tier = profile ? TIERS[profile.tier as TierId] : null;

  const links = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <NavLink key={item.to} {...item} onClick={() => setMenu(false)} />
      ))}
      <NavLink to="/saved" label="Saved" icon={Bookmark} onClick={() => setMenu(false)} />
      <NavLink to="/membership" label="Membership" icon={UserRound} onClick={() => setMenu(false)} />
    </nav>
  );

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:h-16 sm:px-6">
          <button
            type="button"
            className="grid size-11 place-items-center rounded-lg text-muted hover:bg-elevated lg:hidden"
            aria-label="Open menu"
            onClick={() => setMenu(true)}
          >
            <Menu className="size-5" />
          </button>
          <Wordmark />
          <form
            className="mx-auto hidden max-w-md flex-1 md:block"
            onSubmit={(e) => {
              e.preventDefault();
              void nav({ to: "/search", search: { q } });
            }}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search the tape"
                className="pl-9"
              />
            </div>
          </form>
          <div className="ml-auto flex items-center gap-1">
            {profile ? (
              <Link
                to="/portfolio"
                className="hidden h-9 items-center rounded-lg px-3 text-xs tabular text-muted hover:bg-elevated hover:text-fg sm:flex"
              >
                {compactDollars(profile.cash_cents)}
              </Link>
            ) : null}
            <Link
              to="/search"
              search={{ q: "" }}
              className="grid size-11 place-items-center rounded-lg text-muted hover:bg-elevated hover:text-fg md:hidden"
              aria-label="Search"
            >
              <Search className="size-4" />
            </Link>
            <Notifications />
            {user ? (
              <Button size="icon-sm" variant="ghost" className="hidden sm:grid" onClick={() => setCompose(true)} aria-label="Write">
                <PenLine className="size-4" />
              </Button>
            ) : null}
            <AuthSlot />
          </div>
        </div>
      </header>
      <p className="border-b border-border bg-elevated/80 px-3 py-1.5 text-center text-[11px] leading-snug text-subtle sm:px-6">
        Demonstration floor · paper capital · not an offer to sell securities
      </p>

      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] flex-col gap-6 overflow-y-auto py-6 pr-4 pl-6 lg:flex">
          {links}
          {user ? (
            <Button className="w-full" onClick={() => setCompose(true)}>
              Write
            </Button>
          ) : null}
          {profile && tier ? (
            <Link to="/membership" className="rounded-2xl bg-surface p-4 hairline">
              <p className="text-xs tracking-wide text-subtle uppercase">Floor {tier.floor}</p>
              <p className="font-display text-lg">{tier.name}</p>
              <p className="mt-1 text-xs text-muted">{profile.handle}</p>
            </Link>
          ) : null}
          <p className="mt-auto text-[11px] leading-relaxed text-subtle">
            Demonstration floor.{" "}
            <Link to="/legal/privacy" className="hover:text-fg">
              Privacy
            </Link>
            {" · "}
            <Link to="/legal/terms" className="hover:text-fg">
              Terms
            </Link>
            {" · "}
            <Link to="/legal/support" className="hover:text-fg">
              Support
            </Link>
          </p>
        </aside>
        <main className="min-w-0 px-3 pt-4 pb-24 sm:px-6 sm:pt-6 lg:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6 px-1 pb-[env(safe-area-inset-bottom)]">
          {NAV.slice(0, 6).map((item) => {
            const exact = "exact" in item && item.exact;
            const active = exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 text-xs text-muted",
                  active && "text-fg",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="flex flex-col gap-6 p-6">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <Wordmark />
          {links}
          <p className="mt-auto text-[11px] leading-relaxed text-subtle">
            Demonstration floor.{" "}
            <Link to="/legal/privacy" onClick={() => setMenu(false)} className="hover:text-fg">
              Privacy
            </Link>
            {" · "}
            <Link to="/legal/terms" onClick={() => setMenu(false)} className="hover:text-fg">
              Terms
            </Link>
            {" · "}
            <Link to="/legal/support" onClick={() => setMenu(false)} className="hover:text-fg">
              Support
            </Link>
          </p>
        </SheetContent>
      </Sheet>

      <ComposeDialog open={compose} onOpenChange={setCompose} />
    </div>
  );
}
