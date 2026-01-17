import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const create = mutation({
  args: {
    sellerId: v.id("users"),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    condition: v.string(),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const listingId = await ctx.db.insert("listings", {
      ...args,
      status: "active",
      createdAt: Date.now(),
    });
    return listingId;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .collect();

    const listingsWithSellers = await Promise.all(
      listings.map(async (listing) => {
        const seller = await ctx.db.get(listing.sellerId);
        const imageUrls = await Promise.all(
          listing.images.map(async (id) => {
            if (id.startsWith("http")) return id;
            return await ctx.storage.getUrl(id as Id<"_storage">);
          })
        );
        return { ...listing, seller, imageUrls: imageUrls.filter(Boolean) as string[] };
      })
    );

    return listingsWithSellers;
  },
});

export const getById = query({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);
    if (!listing) return null;

    const seller = await ctx.db.get(listing.sellerId);
    const imageUrls = await Promise.all(
      listing.images.map(async (id) => {
        if (id.startsWith("http")) return id;
        return await ctx.storage.getUrl(id as Id<"_storage">);
      })
    );
    return { ...listing, seller, imageUrls: imageUrls.filter(Boolean) as string[] };
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.userId))
      .order("desc")
      .collect();

    return await Promise.all(
      listings.map(async (listing) => {
        const imageUrls = await Promise.all(
          listing.images.map(async (id) => {
            if (id.startsWith("http")) return id;
            return await ctx.storage.getUrl(id as Id<"_storage">);
          })
        );
        return { ...listing, imageUrls: imageUrls.filter(Boolean) as string[] };
      })
    );
  },
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("status"), "active"))
      .order("desc")
      .collect();

    const listingsWithSellers = await Promise.all(
      listings.map(async (listing) => {
        const seller = await ctx.db.get(listing.sellerId);
        return { ...listing, seller };
      })
    );

    return listingsWithSellers;
  },
});

export const updateStatus = mutation({
  args: {
    listingId: v.id("listings"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.listingId, { status: args.status });
  },
});

export const deleteListing = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.listingId);
  },
});

export const update = mutation({
  args: {
    listingId: v.id("listings"),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    condition: v.string(),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { listingId, ...updates } = args;
    await ctx.db.patch(listingId, updates);
  },
});
