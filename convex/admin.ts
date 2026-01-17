import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const isAdmin = query({
  args: { clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const clerkId = args.clerkId;
    if (!clerkId) return false;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    return user?.role === "admin" || user?.role === "super_admin";
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const listings = await ctx.db.query("listings").collect();
    const reports = await ctx.db.query("reports").collect();

    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    return {
      totalUsers: users.length,
      newUsersToday: users.filter((u) => u.createdAt > dayAgo).length,
      newUsersThisWeek: users.filter((u) => u.createdAt > weekAgo).length,
      bannedUsers: users.filter((u) => u.isBanned).length,
      totalListings: listings.length,
      activeListings: listings.filter((l) => l.status === "active").length,
      pendingReview: listings.filter((l) => l.moderationStatus === "flagged").length,
      rejectedListings: listings.filter((l) => l.status === "rejected").length,
      totalReports: reports.length,
      pendingReports: reports.filter((r) => r.status === "pending").length,
      resolvedReports: reports.filter((r) => r.status === "resolved").length,
    };
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").order("desc").collect();
    const usersWithListingCount = await Promise.all(
      users.map(async (user) => {
        const listings = await ctx.db
          .query("listings")
          .withIndex("by_seller", (q) => q.eq("sellerId", user._id))
          .collect();
        return {
          ...user,
          listingCount: listings.length,
          activeListingCount: listings.filter((l) => l.status === "active").length,
        };
      })
    );
    return usersWithListingCount;
  },
});

export const getAllListings = query({
  args: {},
  handler: async (ctx) => {
    const listings = await ctx.db.query("listings").order("desc").collect();
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

export const getFlaggedListings = query({
  args: {},
  handler: async (ctx) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_moderation_status", (q) => q.eq("moderationStatus", "flagged"))
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

export const getAllReports = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db.query("reports").order("desc").collect();
    const reportsWithDetails = await Promise.all(
      reports.map(async (report) => {
        const listing = await ctx.db.get(report.listingId);
        const reporter = await ctx.db.get(report.reporterId);
        const resolvedByUser = report.resolvedBy
          ? await ctx.db.get(report.resolvedBy)
          : null;
        return { ...report, listing, reporter, resolvedByUser };
      })
    );
    return reportsWithDetails;
  },
});

export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db
      .query("moderationLogs")
      .withIndex("by_created")
      .order("desc")
      .take(50);
    const logsWithAdmin = await Promise.all(
      logs.map(async (log) => {
        const admin = await ctx.db.get(log.adminId);
        return { ...log, admin };
      })
    );
    return logsWithAdmin;
  },
});

export const approveListing = mutation({
  args: {
    listingId: v.id("listings"),
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.listingId, {
      status: "active",
      moderationStatus: "clean",
      reviewedBy: args.adminId,
      reviewedAt: Date.now(),
    });
    await ctx.db.insert("moderationLogs", {
      adminId: args.adminId,
      action: "approve_listing",
      targetType: "listing",
      targetId: args.listingId,
      createdAt: Date.now(),
    });
  },
});

export const rejectListing = mutation({
  args: {
    listingId: v.id("listings"),
    adminId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.listingId, {
      status: "rejected",
      moderationStatus: "rejected",
      reviewedBy: args.adminId,
      reviewedAt: Date.now(),
    });
    await ctx.db.insert("moderationLogs", {
      adminId: args.adminId,
      action: "reject_listing",
      targetType: "listing",
      targetId: args.listingId,
      reason: args.reason,
      createdAt: Date.now(),
    });
  },
});

export const removeListing = mutation({
  args: {
    listingId: v.id("listings"),
    adminId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.listingId, {
      status: "removed",
      reviewedBy: args.adminId,
      reviewedAt: Date.now(),
    });
    await ctx.db.insert("moderationLogs", {
      adminId: args.adminId,
      action: "remove_listing",
      targetType: "listing",
      targetId: args.listingId,
      reason: args.reason,
      createdAt: Date.now(),
    });
  },
});

export const banUser = mutation({
  args: {
    userId: v.id("users"),
    adminId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isBanned: true,
      banReason: args.reason,
    });
    const userListings = await ctx.db
      .query("listings")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.userId))
      .collect();
    for (const listing of userListings) {
      await ctx.db.patch(listing._id, { status: "removed" });
    }
    await ctx.db.insert("moderationLogs", {
      adminId: args.adminId,
      action: "ban_user",
      targetType: "user",
      targetId: args.userId,
      reason: args.reason,
      createdAt: Date.now(),
    });
  },
});

export const unbanUser = mutation({
  args: {
    userId: v.id("users"),
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isBanned: false,
      banReason: undefined,
    });
    await ctx.db.insert("moderationLogs", {
      adminId: args.adminId,
      action: "unban_user",
      targetType: "user",
      targetId: args.userId,
      createdAt: Date.now(),
    });
  },
});

export const warnUser = mutation({
  args: {
    userId: v.id("users"),
    adminId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;
    await ctx.db.patch(args.userId, {
      warningCount: (user.warningCount || 0) + 1,
    });
    await ctx.db.insert("moderationLogs", {
      adminId: args.adminId,
      action: "warn_user",
      targetType: "user",
      targetId: args.userId,
      reason: args.reason,
      createdAt: Date.now(),
    });
  },
});

export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    adminId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role });
    await ctx.db.insert("moderationLogs", {
      adminId: args.adminId,
      action: "set_role",
      targetType: "user",
      targetId: args.userId,
      metadata: JSON.stringify({ role: args.role }),
      createdAt: Date.now(),
    });
  },
});

export const resolveReport = mutation({
  args: {
    reportId: v.id("reports"),
    adminId: v.id("users"),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reportId, {
      status: "resolved",
      resolvedBy: args.adminId,
      resolvedAt: Date.now(),
    });
    await ctx.db.insert("moderationLogs", {
      adminId: args.adminId,
      action: "resolve_report",
      targetType: "report",
      targetId: args.reportId,
      metadata: JSON.stringify({ action: args.action }),
      createdAt: Date.now(),
    });
  },
});

export const createReport = mutation({
  args: {
    listingId: v.id("listings"),
    reporterId: v.id("users"),
    reason: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("reports", {
      listingId: args.listingId,
      reporterId: args.reporterId,
      reason: args.reason,
      description: args.description,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});
