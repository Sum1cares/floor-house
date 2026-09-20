import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toastErr } from "@/lib/errors";
import { createPost, listCommunities } from "@/lib/server/feed";

export function ComposeDialog({
  open,
  onOpenChange,
  defaultFloor,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultFloor?: string;
}) {
  const floors = useQuery({ queryKey: ["communities"], queryFn: () => listCommunities() });
  const [slug, setSlug] = useState(defaultFloor ?? "the-pit");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("thread");
  const nav = useNavigate();
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => createPost({ data: { communitySlug: slug, title, body, kind } }),
    onSuccess: (res) => {
      toast.success("Posted to the Floor.");
      onOpenChange(false);
      setTitle("");
      setBody("");
      void qc.invalidateQueries({ queryKey: ["feed"] });
      void qc.invalidateQueries({ queryKey: ["community"] });
      void nav({ to: "/post/$id", params: { id: String(res.id) } });
    },
    onError: toastErr,
  });

  useEffect(() => {
    if (open) setSlug(defaultFloor ?? "the-pit");
  }, [defaultFloor, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Write the tape</DialogTitle>
        <DialogDescription>Due diligence over hot takes. The room can tell.</DialogDescription>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-muted">
              Floor
              <select
                className="mt-1 flex h-11 w-full rounded-lg bg-elevated px-3 text-sm text-fg hairline"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              >
                {(floors.data ?? []).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted">
              Kind
              <select
                className="mt-1 flex h-11 w-full rounded-lg bg-elevated px-3 text-sm text-fg hairline"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                <option value="thread">Thread</option>
                <option value="dd">Due diligence</option>
                <option value="deal">Deal note</option>
                <option value="market">Market take</option>
              </select>
            </label>
          </div>
          <Input
            placeholder="Headline (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={160}
          />
          <Textarea
            placeholder="What did you see, number, or underwrite?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Posting…" : "Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
