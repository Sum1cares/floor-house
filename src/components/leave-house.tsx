import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { signOut } from "@/lib/auth/client";
import { toastErr } from "@/lib/errors";
import { deleteMe } from "@/lib/server/me";

export function LeaveHouse() {
  const [open, setOpen] = useState(false);
  const leave = useMutation({
    mutationFn: () => deleteMe(),
    onSuccess: () => {
      toast.success("Membership closed.");
      setOpen(false);
      void signOut("/").catch(() => {
        window.location.href = "/";
      });
    },
    onError: toastErr,
  });

  return (
    <section className="max-w-lg rounded-3xl bg-surface p-5 hairline">
      <h2 className="font-display text-2xl">Leave the house</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Deletes your profile, positions, follows, bookmarks, and sessions. Posts stay on the tape as
        Former member. Required by the stores. This cannot be undone.
      </p>
      <Button className="mt-4" variant="danger" onClick={() => setOpen(true)}>
        Delete my membership
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Close this membership?</DialogTitle>
          <DialogDescription className="mt-2">
            Your name, email, positions, follows, bookmarks, notifications, and sessions are deleted.
            Threads you wrote stay as Former member so the diligence still reads. You can also email
            support@floor.house from outside the app.
          </DialogDescription>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="danger" disabled={leave.isPending} onClick={() => leave.mutate()}>
              {leave.isPending ? "Closing…" : "Yes, delete my data"}
            </Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Stay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
