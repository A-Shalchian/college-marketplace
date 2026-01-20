"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCallback, useState } from "react";

interface UseSaveListingProps {
  listingId: Id<"listings">;
  userId?: Id<"users"> | null;
  sellerId?: Id<"users">;
}

export function useSaveListing({ listingId, userId, sellerId }: UseSaveListingProps) {
  const [isToggling, setIsToggling] = useState(false);

  const isSaved = useQuery(
    api.savedListings.isSaved,
    userId ? { userId, listingId } : "skip"
  );

  const toggleSaveMutation = useMutation(api.savedListings.toggleSave);

  const isOwnListing = userId && sellerId && userId === sellerId;

  const toggleSave = useCallback(async () => {
    if (!userId || isOwnListing) return;

    setIsToggling(true);
    try {
      await toggleSaveMutation({ userId, listingId });
    } catch (error) {
      console.error("Failed to toggle save:", error);
    } finally {
      setIsToggling(false);
    }
  }, [userId, listingId, isOwnListing, toggleSaveMutation]);

  return {
    isSaved: isSaved ?? false,
    isLoading: isSaved === undefined,
    isToggling,
    isOwnListing: !!isOwnListing,
    canSave: !!userId && !isOwnListing,
    toggleSave,
  };
}
