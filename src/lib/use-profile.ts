import { useQuery } from "@tanstack/react-query";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMe } from "@/lib/server/me";

export function useProfile() {
  const { user, isPending: authPending } = useCurrentUserState();
  const query = useQuery({
    queryKey: ["me", user?.id],
    queryFn: () => getMe({ data: { name: user?.displayName, email: user?.primaryEmail } }),
    enabled: Boolean(user),
  });
  return { user, authPending, ...query };
}
