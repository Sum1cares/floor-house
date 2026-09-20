export const BENEFIT_CATEGORIES = [
  { id: "fleet", label: "Fleet" },
  { id: "lodging", label: "Rooms" },
  { id: "gatherings", label: "Gatherings" },
  { id: "stage", label: "Stage" },
  { id: "sponsored", label: "Sponsored" },
] as const;

export type BenefitCategoryId = (typeof BENEFIT_CATEGORIES)[number]["id"];

export const BRING_CAP = 25;

export function isUnlocked(memberCount: number, unlockAt: number) {
  return memberCount >= unlockAt;
}

export function membersNeeded(memberCount: number, unlockAt: number) {
  return Math.max(0, unlockAt - memberCount);
}

export function nextBenefit<T extends { unlock_at: number }>(memberCount: number, benefits: T[]) {
  const locked = benefits
    .filter((b) => b.unlock_at > memberCount)
    .sort((a, b) => a.unlock_at - b.unlock_at);
  return locked[0] ?? null;
}

export function previousUnlock<T extends { unlock_at: number }>(memberCount: number, benefits: T[]) {
  const open = benefits
    .filter((b) => b.unlock_at <= memberCount)
    .sort((a, b) => b.unlock_at - a.unlock_at);
  return open[0] ?? null;
}

export function unlockProgress(memberCount: number, from: number, to: number) {
  if (to <= from) return 100;
  return Math.max(0, Math.min(100, Math.round(((memberCount - from) / (to - from)) * 100)));
}
