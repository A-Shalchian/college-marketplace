import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { moderateContent, Blocklist } from "./moderation";
import {
  requireActiveUser,
  requireListingOwner,
  checkRateLimit,
  validateListingInput,
  validateEnum,
  ALLOWED_VALUES,
  getAuthenticatedUser,
} from "./security";

async function getBlocklist(ctx: QueryCtx | MutationCtx): Promise<Blocklist> {
  const setting = await ctx.db
    .query("settings")
    .withIndex("by_key", (q) => q.eq("key", "moderation_blocklist"))
    .unique();

  if (!setting) {
    return { drugs: [], sexual: [], weapons: [], scam: [], coded: [] };
  }

  return JSON.parse(setting.value);
}

export const create = mutation({
  args: {
    sellerId: v.id("users"),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    condition: v.string(),
    campus: v.string(),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveUser(ctx, args.sellerId);

    await checkRateLimit(ctx, args.sellerId, "createListing");

    const validatedInput = validateListingInput({
      title: args.title,
      description: args.description,
      price: args.price,
      category: args.category,
      condition: args.condition,
      campus: args.campus,
      images: args.images,
    });

    const blocklist = await getBlocklist(ctx);
    const moderation = moderateContent(validatedInput.title, validatedInput.description, blocklist);
    const status = moderation.status === "rejected" ? "rejected" : "active";

    const listingId = await ctx.db.insert("listings", {
      sellerId: args.sellerId,
      title: validatedInput.title,
      description: validatedInput.description,
      price: validatedInput.price,
      category: validatedInput.category,
      condition: validatedInput.condition,
      campus: validatedInput.campus,
      images: validatedInput.images,
      status,
      moderationStatus: moderation.status,
      moderationFlags: moderation.flags,
      createdAt: Date.now(),
    });

    return { listingId, moderation };
  },
});

export const getAll = query({
  args: {
    paginationOpts: v.optional(v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    })),
  },
  handler: async (ctx, args) => {
    const paginationOpts = args.paginationOpts ?? { numItems: 50, cursor: null };

    const result = await ctx.db
      .query("listings")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .paginate(paginationOpts);

    const listingsWithSellers = await Promise.all(
      result.page.map(async (listing) => {
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

    return {
      page: listingsWithSellers,
      continueCursor: result.continueCursor,
      isDone: result.isDone,
    };
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
    const isValidCategory = ALLOWED_VALUES.categories.includes(args.category as typeof ALLOWED_VALUES.categories[number]);
    if (!isValidCategory) {
      return [];
    }

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
    const user = await getAuthenticatedUser(ctx);

    await requireListingOwner(ctx, args.listingId, user._id);

    const userAllowedStatuses = ["active", "sold", "draft"] as const;
    if (!userAllowedStatuses.includes(args.status as typeof userAllowedStatuses[number])) {
      throw new Error(`Invalid status: "${args.status}". Allowed values: ${userAllowedStatuses.join(", ")}`);
    }

    await ctx.db.patch(args.listingId, { status: args.status });
  },
});

export const deleteListing = mutation({
  args: {
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    await checkRateLimit(ctx, user._id, "deleteListing");

    await requireListingOwner(ctx, args.listingId, user._id);

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
    campus: v.string(),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    await checkRateLimit(ctx, user._id, "updateListing");

    await requireListingOwner(ctx, args.listingId, user._id);

    const validatedInput = validateListingInput({
      title: args.title,
      description: args.description,
      price: args.price,
      category: args.category,
      condition: args.condition,
      campus: args.campus,
      images: args.images,
    });

    const blocklist = await getBlocklist(ctx);
    const moderation = moderateContent(validatedInput.title, validatedInput.description, blocklist);
    const status = moderation.status === "rejected" ? "rejected" : "active";

    await ctx.db.patch(args.listingId, {
      title: validatedInput.title,
      description: validatedInput.description,
      price: validatedInput.price,
      category: validatedInput.category,
      condition: validatedInput.condition,
      campus: validatedInput.campus,
      images: validatedInput.images,
      status,
      moderationStatus: moderation.status,
      moderationFlags: moderation.flags,
    });

    return { moderation };
  },
});
