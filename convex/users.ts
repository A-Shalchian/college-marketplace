import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  requireActiveUser,
  checkRateLimit,
  validateString,
  sanitizeInput,
  VALIDATION,
} from "./security";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);

    if (user) {
      return {
        _id: user._id,
        _creationTime: user._creationTime,
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
