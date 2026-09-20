import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { AgeGate } from "@/components/age-gate";
import { bootNativeShell } from "@/lib/native";

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: false } },
      }),
  );
  useEffect(() => {
    void bootNativeShell();
  }, []);
  return (
    <QueryClientProvider client={client}>
      {children}
      <AgeGate />
      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{
          className: "!bg-surface !text-fg !border-border !rounded-2xl",
        }}
      />
    </QueryClientProvider>
  );
}
