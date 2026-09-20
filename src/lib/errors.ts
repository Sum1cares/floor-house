import { toast } from "sonner";

export function errMessage(err: unknown) {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string") return err;
  return "Something failed.";
}

export function toastErr(err: unknown) {
  const msg = errMessage(err);
  if (msg === "Unauthorized") {
    toast.message("Sign in to do that.");
    return;
  }
  toast.error(msg);
}
