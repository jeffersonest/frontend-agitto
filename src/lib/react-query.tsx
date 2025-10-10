"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import * as React from "react";

let client: QueryClient | null = null;

function getClient() {
  if (!client) {
    client = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: true,
          staleTime: 30_000,
          gcTime: 5 * 60_000,
        },
      },
    });
  }
  return client;
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const qc = React.useMemo(() => getClient(), []);
  return (
    <QueryClientProvider client={qc}>
      {children}
      {process.env.NODE_ENV !== "production" ? <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" /> : null}
    </QueryClientProvider>
  );
}
