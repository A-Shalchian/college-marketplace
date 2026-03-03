"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { useStoreUser } from "@/hooks/use-store-user";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

function StoreUser({ children }: { children: ReactNode }) {
  useStoreUser();
  return <>{children}</>;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <StoreUser>{children}</StoreUser>
    </ConvexProviderWithClerk>
  );
}
