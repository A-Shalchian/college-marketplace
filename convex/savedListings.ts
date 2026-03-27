import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { requireActiveUser, checkRateLimit } from "./security";

export const toggleSave = mutation({
  args: {
    userId: v.id("users"),
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    await requireActiveUser(ctx, args.userId);

    await checkRateLimit(ctx, args.userId, "updateUser");

    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.sellerId === args.userId) {
      throw new Error("Cannot save your own listing");
    }

    if (listing.status !== "active") {
      throw new Error("Cannot save inactive listings");
    }

    const existing = await ctx.db
      .query("savedListings")
      .withIndex("by_user_and_listing", (q) =>
        q.eq("userId", args.userId).eq("listingId", args.listingId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { saved: false };
    } else {
      await ctx.db.insert("savedListings", {
        userId: args.userId,
        listingId: args.listingId,
        savedAt: Date.now(),
      });
      return { saved: true };
    }
  },
});

export const isSaved = query({
  args: {
    userId: v.optional(v.id("users")),
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return false;
    const userId = args.userId;

    const saved = await ctx.db
      .query("savedListings")
      .withIndex("by_user_and_listing", (q) =>
        q.eq("userId", userId).eq("listingId", args.listingId)
      )
      .unique();

    return !!saved;
  },
});

export const getSavedByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const savedRecords = await ctx.db
      .query("savedListings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);

    const results = await Promise.all(
      savedRecords.map(async (record) => {
        const listing = await ctx.db.get(record.listingId);
        if (!listing || listing.status !== "active") return null;

        const seller = await ctx.db.get(listing.sellerId);
        let thumbnailUrl: string | null = null;
        if (listing.images.length > 0) {
          const firstImage = listing.images[0];
          thumbnailUrl = firstImage.startsWith("http")
            ? firstImage
            : await ctx.storage.getUrl(firstImage as Id<"_storage">);
        }

        return {
          ...listing,
          seller,
          imageUrls: thumbnailUrl ? [thumbnailUrl] : [],
          savedAt: record.savedAt,
        };
      })
    );

    return results.filter(Boolean);
  },
});

export const getSavedListingIds = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    const userId = args.userId;

    const savedRecords = await ctx.db
      .query("savedListings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return savedRecords.map((record) => record.listingId);
  },
});

export const unsave = mutation({
  args: {
    userId: v.id("users"),
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    // SECURITY: Verify user exists and is not banned
    await requireActiveUser(ctx, args.userId);

    const existing = await ctx.db
      .query("savedListings")
      .withIndex("by_user_and_listing", (q) =>
        q.eq("userId", args.userId).eq("listingId", args.listingId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return { saved: false };
  },
});
