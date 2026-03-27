import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  getAuthenticatedUser,
  checkRateLimit,
  validateString,
  sanitizeInput,
  getUserId,
  requireAdmin,
} from "./security";

export const send = mutation({
  args: {
    topic: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    await checkRateLimit(ctx, user._id, "contactMessage");

    const topic = validateString(
      sanitizeInput(args.topic),
      "Topic",
      { minLength: 1, maxLength: 100 }
    );

    const message = validateString(
      sanitizeInput(args.message),
      "Message",
      { minLength: 10, maxLength: 5000 }
    );

    await ctx.db.insert("contactMessages", {
      userId: user._id,
      topic,
      message,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;
    await requireAdmin(ctx, userId);

    const messages = await ctx.db
      .query("contactMessages")
      .withIndex("by_created")
      .order("desc")
      .take(100);

    const messagesWithUsers = await Promise.all(
      messages.map(async (msg) => {
        const user = await ctx.db.get(msg.userId);
        return { ...msg, user };
      })
    );

    return messagesWithUsers;
  },
});
