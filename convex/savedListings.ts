import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const toggleSave = mutation({
  args: {
    userId: v.id("users"),
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.sellerId === args.userId) {
      throw new Error("Cannot save your own listing");
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
      .collect();

    const results = [];
    for (const record of savedRecords) {
      const listing = await ctx.db.get(record.listingId);
      if (!listing || listing.status !== "active") continue;

      const seller = await ctx.db.get(listing.sellerId);
      const imageUrls = await Promise.all(
        listing.images.map(async (id) => {
          if (id.startsWith("http")) return id;
          return await ctx.storage.getUrl(id as Id<"_storage">);
        })
      );

      results.push({
        ...listing,
        seller,
        imageUrls: imageUrls.filter((url): url is string => url !== null),
        savedAt: record.savedAt,
      });
    }

    return results;
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
