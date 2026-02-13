import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireActiveUser, checkRateLimit, getUserByClerkId } from "./security";

export const generateUploadUrl = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireActiveUser(ctx, args.userId);

    await checkRateLimit(ctx, args.userId, "generateUploadUrl");

    return await ctx.storage.generateUploadUrl();
  },
});

export const deleteFile = mutation({
  args: {
    clerkId: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.clerkId);

    await checkRateLimit(ctx, user._id, "deleteListing");

    const listings = await ctx.db
      .query("listings")
      .filter((q) => q.eq(q.field("sellerId"), user._id))
      .collect();

    const ownsFile = listings.some((listing) =>
      listing.images.includes(args.storageId)
    );

    if (!ownsFile) {
      throw new Error("Unauthorized: You can only delete your own files");
    }

    await ctx.storage.delete(args.storageId);
  },
});
