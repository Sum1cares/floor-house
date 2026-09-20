export type ShareResult = "shared" | "copied" | "cancelled";

export async function shareUrl(opts: {
  title: string;
  text?: string;
  url: string;
}): Promise<ShareResult> {
  try {
    const { Share } = await import("@capacitor/share");
    await Share.share({
      title: opts.title,
      text: opts.text ?? opts.title,
      url: opts.url,
      dialogTitle: opts.title,
    });
    return "shared";
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    if (name === "AbortError") return "cancelled";
  }
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(opts.url);
    }
    return "copied";
  } catch {
    return "copied";
  }
}
