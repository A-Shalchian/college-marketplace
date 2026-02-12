import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  requireActiveUser,
  checkRateLimit,
  validateString,
  validateEmail,
  sanitizeInput,
  VALIDATION,
} from "./security";

export const createOrGetUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.clerkId || args.clerkId.length < 5 || args.clerkId.length > 100) {
      throw new Error("Invalid authentication identifier");
    }

    const email = validateEmail(args.email);

    const name = validateString(
      sanitizeInput(args.name),
      "Name",
      VALIDATION.userName
    );

    let imageUrl = args.imageUrl;
    if (imageUrl) {
      const allowedDomains = [
        "img.clerk.com",
        "images.clerk.dev",
        "gravatar.com",
        "www.gravatar.com",
      ];
      try {
        const url = new URL(imageUrl);
        if (url.protocol !== "https:") {
          imageUrl = undefined;
        } else if (!allowedDomains.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`))) {
          imageUrl = undefined;
        }
      } catch {
        imageUrl = undefined;
      }
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      if (existingUser.isBanned) {
        throw new Error(
          "Your account has been suspended. Reason: " +
            (existingUser.banReason || "Policy violation")
        );
      }
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email,
      name,
      imageUrl,
      createdAt: Date.now(),
    });

    return userId;
  },
});

export const getCurrentUser = query({
  args: { clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const clerkId = args.clerkId;
    if (!clerkId) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (user) {
      return {
        _id: user._id,
        _creationTime: user._creationTime,
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
        defaultCampus: user.defaultCampus,
        role: user.role,
        isBanned: user.isBanned,
        banReason: user.isBanned ? user.banReason : undefined,
        warningCount: user.warningCount,
        createdAt: user.createdAt,
      };
    }

    return null;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (user) {
      return {
        _id: user._id,
        name: user.name,
        imageUrl: user.imageUrl,
        defaultCampus: user.defaultCampus,
        createdAt: user.createdAt,
      };
    }

    return null;
  },
});

const ALLOWED_CAMPUSES = [
  "St. James Campus",
  "Casa Loma Campus",
  "Waterfront Campus",
] as const;

export const updateDefaultCampus = mutation({
  args: {
    userId: v.id("users"),
    defaultCampus: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireActiveUser(ctx, args.userId);

    await checkRateLimit(ctx, args.userId, "updateUser");

    let campus: string;
    if (ALLOWED_CAMPUSES.includes(args.defaultCampus as typeof ALLOWED_CAMPUSES[number])) {
      campus = args.defaultCampus;
    } else {
      campus = validateString(
        sanitizeInput(args.defaultCampus),
        "Campus",
        { minLength: 2, maxLength: 100 }
      );
    }

    await ctx.db.patch(args.userId, {
      defaultCampus: campus,
    });
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireActiveUser(ctx, args.userId);

    await checkRateLimit(ctx, args.userId, "updateUser");

    const updates: { name?: string; imageUrl?: string } = {};

    if (args.name !== undefined) {
      updates.name = validateString(
        sanitizeInput(args.name),
        "Name",
        VALIDATION.userName
      );
    }

    if (args.imageUrl !== undefined) {
      const allowedDomains = [
        "img.clerk.com",
        "images.clerk.dev",
        "gravatar.com",
        "www.gravatar.com",
      ];
      try {
        const url = new URL(args.imageUrl);
        if (url.protocol !== "https:") {
          throw new Error("Image URL must use HTTPS");
        }
        if (!allowedDomains.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`))) {
          throw new Error("Image URL must be from an allowed domain");
        }
        updates.imageUrl = args.imageUrl;
      } catch (e) {
        if (e instanceof Error && e.message.includes("allowed domain")) {
          throw e;
        }
        throw new Error("Invalid image URL format");
      }
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.userId, updates);
    }
  },
});
