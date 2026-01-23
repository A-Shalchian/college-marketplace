import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Check if a conversation exists (without creating one)
export const getExistingConversation = query({
  args: {
    listingId: v.id("listings"),
    buyerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_listing", (q) => q.eq("listingId", args.listingId))
      .filter((q) => q.eq(q.field("buyerId"), args.buyerId))
      .unique();

    return existing?._id ?? null;
  },
});

// Only used when there's already a conversation with messages
export const getOrCreateConversation = mutation({
  args: {
    listingId: v.id("listings"),
    buyerId: v.id("users"),
    sellerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_listing", (q) => q.eq("listingId", args.listingId))
      .filter((q) => q.eq(q.field("buyerId"), args.buyerId))
      .unique();

    if (existing) {
      return existing._id;
    }

    const conversationId = await ctx.db.insert("conversations", {
      listingId: args.listingId,
      buyerId: args.buyerId,
      sellerId: args.sellerId,
      lastMessageAt: Date.now(),
    });

    return conversationId;
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.optional(v.id("conversations")),
    // These are required when creating a new conversation
    listingId: v.optional(v.id("listings")),
    buyerId: v.optional(v.id("users")),
    sellerId: v.optional(v.id("users")),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    let conversationId = args.conversationId;

    // If no conversationId, create the conversation now (on first message)
    if (!conversationId) {
      if (!args.listingId || !args.buyerId || !args.sellerId) {
        throw new Error("listingId, buyerId, and sellerId are required when creating a new conversation");
      }

      // Check if conversation already exists
      const existing = await ctx.db
        .query("conversations")
        .withIndex("by_listing", (q) => q.eq("listingId", args.listingId!))
        .filter((q) => q.eq(q.field("buyerId"), args.buyerId!))
        .unique();

      if (existing) {
        conversationId = existing._id;
      } else {
        conversationId = await ctx.db.insert("conversations", {
          listingId: args.listingId,
          buyerId: args.buyerId,
          sellerId: args.sellerId,
          lastMessageAt: Date.now(),
        });
      }
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId,
      senderId: args.senderId,
      content: args.content,
      createdAt: Date.now(),
    });

    await ctx.db.patch(conversationId, {
      lastMessageAt: Date.now(),
    });

    return { messageId, conversationId };
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    const messagesWithSenders = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return { ...message, sender };
      })
    );

    return messagesWithSenders;
  },
});

export const getUserConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const asBuyer = await ctx.db
      .query("conversations")
      .withIndex("by_buyer", (q) => q.eq("buyerId", args.userId))
      .collect();

    const asSeller = await ctx.db
      .query("conversations")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.userId))
      .collect();

    const allConversations = [...asBuyer, ...asSeller];

    const conversationsWithDetails = await Promise.all(
      allConversations.map(async (conv) => {
        const listing = await ctx.db.get(conv.listingId);
        const otherUserId =
          conv.buyerId === args.userId ? conv.sellerId : conv.buyerId;
        const otherUser = await ctx.db.get(otherUserId);

        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conv._id)
          )
          .order("desc")
          .first();

        return {
          ...conv,
          listing,
          otherUser,
          lastMessage,
        };
      })
    );

    // Only show conversations that have at least one message
    const conversationsWithMessages = conversationsWithDetails.filter(
      (conv) => conv.lastMessage !== null
    );

    return conversationsWithMessages.sort(
      (a, b) => b.lastMessageAt - a.lastMessageAt
    );
  },
});

export const getConversationById = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const listing = await ctx.db.get(conversation.listingId);
    const buyer = await ctx.db.get(conversation.buyerId);
    const seller = await ctx.db.get(conversation.sellerId);

    let imageUrls: string[] = [];
    if (listing) {
      imageUrls = await Promise.all(
        listing.images.map(async (id) => {
          if (id.startsWith("http")) return id;
          return await ctx.storage.getUrl(id as Id<"_storage">);
        })
      ).then((urls) => urls.filter(Boolean) as string[]);
    }

    return {
      ...conversation,
      listing: listing ? { ...listing, imageUrls } : null,
      buyer,
      seller,
    };
  },
});
