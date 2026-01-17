"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function useStoreUser() {
  const { user, isLoaded } = useUser();
  const createOrGetUser = useMutation(api.users.createOrGetUser);

  useEffect(() => {
    if (!isLoaded || !user) return;

    createOrGetUser({
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? "",
      name: user.fullName ?? user.firstName ?? "User",
      imageUrl: user.imageUrl,
    });
  }, [user, isLoaded, createOrGetUser]);
}
