import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { toastErr } from "@/lib/errors";
import { toggleFollow } from "@/lib/server/members";

export function FollowButton({
  handle,
  following,
}: {
  handle: string;
  following?: boolean;
}) {
  const user = useCurrentUser();
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () => toggleFollow({ data: { handle } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["social"] });
      void qc.invalidateQueries({ queryKey: ["member"] });
      void qc.invalidateQueries({ queryKey: ["feed", "following"] });
      void qc.invalidateQueries({ queryKey: ["trending"] });
    },
    onError: toastErr,
  });
  return (
    <Button
      size="sm"
      variant={following ? "secondary" : "default"}
      onClick={() => {
        if (!user) {
          toast.message("Sign in to follow.");
          return;
        }
        mut.mutate();
      }}
      disabled={mut.isPending}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
