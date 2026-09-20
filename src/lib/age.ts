export const AGE_KEY = "floor.age.ok";

export function isLegalPath(pathname: string): boolean {
  return pathname === "/legal" || pathname === "/legal/" || pathname.startsWith("/legal/");
}

export function ageAttested(storage: { getItem(key: string): string | null } | null | undefined): boolean {
  try {
    return storage?.getItem(AGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function attestAge(storage: { setItem(key: string, value: string): void } | null | undefined): void {
  try {
    storage?.setItem(AGE_KEY, "1");
  } catch {
    /* private mode */
  }
}
