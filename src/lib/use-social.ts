import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { getSocialState } from "@/lib/server/feed";

export function useSocial() {
  const user = useCurrentUser();
  return useQuery({
    queryKey: ["social"],
    queryFn: () => getSocialState(),
    enabled: Boolean(user),
  });
}
