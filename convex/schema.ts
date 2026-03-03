import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    defaultCampus: v.optional(v.string()),
    role: v.optional(v.string()),
    isBanned: v.optional(v.boolean()),
    banReason: v.optional(v.string()),
    warningCount: v.optional(v.number()),
    createdAt: v.optional(v.number()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("email", ["email"])
    .index("by_role", ["role"]),

  listings: defineTable({
    sellerId: v.id("users"),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    condition: v.string(),
    campus: v.string(),
    images: v.array(v.string()),
    status: v.string(),
    moderationStatus: v.optional(v.string()),
    moderationFlags: v.optional(v.array(v.string())),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_moderation_status", ["moderationStatus"])
    .index("by_created", ["createdAt"]),

  conversations: defineTable({
    listingId: v.id("listings"),
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    lastMessageAt: v.number(),
    buyerLastReadAt: v.optional(v.number()),
    sellerLastReadAt: v.optional(v.number()),
  })
    .index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"])
    .index("by_listing", ["listingId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),

  reports: defineTable({
    listingId: v.id("listings"),
    reporterId: v.id("users"),
    reason: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    resolvedBy: v.optional(v.id("users")),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_listing", ["listingId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  moderationLogs: defineTable({
    adminId: v.id("users"),
    action: v.string(),
    targetType: v.string(),
    targetId: v.string(),
    reason: v.optional(v.string()),
    metadata: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_admin", ["adminId"])
    .index("by_target", ["targetType", "targetId"])
    .index("by_created", ["createdAt"]),

  settings: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  savedListings: defineTable({
    userId: v.id("users"),
    listingId: v.id("listings"),
    savedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_listing", ["listingId"])
    .index("by_user_and_listing", ["userId", "listingId"]),

  rateLimits: defineTable({
    key: v.string(),
    count: v.number(),
    windowStart: v.number(),
    expiresAt: v.number(),
  })
    .index("by_key", ["key"])
    .index("by_expires", ["expiresAt"]),

  events: defineTable({
    organizerId: v.id("users"),
    title: v.string(),
    description: v.string(),
    campus: v.string(),
    location: v.string(),
    category: v.string(),
    date: v.number(),
    endDate: v.optional(v.number()),
    maxAttendees: v.optional(v.number()),
    imageId: v.optional(v.string()),
    status: v.string(),
    createdAt: v.number(),
  })
    .index("by_organizer", ["organizerId"])
    .index("by_campus", ["campus"])
    .index("by_status", ["status"])
    .index("by_date", ["date"])
    .index("by_created", ["createdAt"]),

  eventAttendees: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    status: v.string(),
    joinedAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_and_user", ["eventId", "userId"]),

  clubs: defineTable({
    creatorId: v.id("users"),
    name: v.string(),
    description: v.string(),
    campus: v.string(),
    category: v.string(),
    imageId: v.optional(v.string()),
    memberCount: v.number(),
    status: v.string(),
    createdAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_campus", ["campus"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  clubMembers: defineTable({
    clubId: v.id("clubs"),
    userId: v.id("users"),
    role: v.string(),
    joinedAt: v.number(),
  })
    .index("by_club", ["clubId"])
    .index("by_user", ["userId"])
    .index("by_club_and_user", ["clubId", "userId"]),

  forumPosts: defineTable({
    authorId: v.id("users"),
    clubId: v.optional(v.id("clubs")),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    campus: v.optional(v.string()),
    isPinned: v.boolean(),
    replyCount: v.number(),
    likeCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_category", ["category"])
    .index("by_club", ["clubId"])
    .index("by_created", ["createdAt"]),

  forumReplies: defineTable({
    postId: v.id("forumPosts"),
    authorId: v.id("users"),
    content: v.string(),
    likeCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_author", ["authorId"]),

  forumLikes: defineTable({
    userId: v.id("users"),
    postId: v.optional(v.id("forumPosts")),
    replyId: v.optional(v.id("forumReplies")),
    createdAt: v.number(),
  })
    .index("by_user_and_post", ["userId", "postId"])
    .index("by_user_and_reply", ["userId", "replyId"]),
});
