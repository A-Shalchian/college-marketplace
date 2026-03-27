import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  getUserId,
  requireAdmin,
  requireSuperAdmin,
  requireActiveUser,
  checkRateLimit,
  validateString,
  validateEnum,
  VALIDATION,
  ALLOWED_VALUES,
  sanitizeInput,
  requireHigherRole,
  getRoleLevel,
  getAuthenticatedUser,
} from "./security";

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return false;

    const user = await ctx.db.get(userId);
    return user?.role === "admin" || user?.role === "super_admin";
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;
    const admin = await ctx.db.get(userId);
    if (!admin) return null;
    await requireAdmin(ctx, admin._id);

    // Use targeted indexed queries instead of loading entire tables
    const [
      activeListings,
      flaggedListings,
      rejectedListings,
      pendingReports,
      resolvedReports,
      bannedUsers,
    ] = await Promise.all([
      ctx.db.query("listings").withIndex("by_status", (q) => q.eq("status", "active")).collect(),
      ctx.db.query("listings").withIndex("by_moderation_status", (q) => q.eq("moderationStatus", "flagged")).collect(),
      ctx.db.query("listings").withIndex("by_status", (q) => q.eq("status", "rejected")).collect(),
      ctx.db.query("reports").withIndex("by_status", (q) => q.eq("status", "pending")).collect(),
      ctx.db.query("reports").withIndex("by_status", (q) => q.eq("status", "resolved")).collect(),
      ctx.db.query("users").withIndex("by_role").filter((q) => q.eq(q.field("isBanned"), true)).collect(),
    ]);

    // Only load recent users for the time-based stats (much smaller set)
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const recentUsers = await ctx.db
      .query("users")
      .order("desc")
      .filter((q) => q.gte(q.field("createdAt"), weekAgo))
      .collect();

    // Lightweight total count — take(500) is a reasonable cap
    const allUsers = await ctx.db.query("users").take(500);

    const totalListings = activeListings.length + flaggedListings.length + rejectedListings.length;
    const totalReports = pendingReports.length + resolvedReports.length;

    return {
      totalUsers: allUsers.length,
      newUsersToday: recentUsers.filter((u) => (u.createdAt ?? 0) > dayAgo).length,
      newUsersThisWeek: recentUsers.length,
      bannedUsers: bannedUsers.length,
      totalListings,
      activeListings: activeListings.length,
      pendingReview: flaggedListings.length,
      rejectedListings: rejectedListings.length,
      totalReports,
      pendingReports: pendingReports.length,
      resolvedReports: resolvedReports.length,
    };
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;
    const admin = await ctx.db.get(userId);
    if (!admin) return null;
    await requireAdmin(ctx, admin._id);

    const users = await ctx.db.query("users").order("desc").take(100);
    const usersWithListingCount = await Promise.all(
      users.map(async (user) => {
        // Only count active listings using index, take(200) instead of collect() to cap
        const activeListings = await ctx.db
          .query("listings")
          .withIndex("by_seller", (q) => q.eq("sellerId", user._id))
          .filter((q) => q.eq(q.field("status"), "active"))
          .take(200);
        return {
          ...user,
          listingCount: activeListings.length,
          activeListingCount: activeListings.length,
        };
      })
    );
    return usersWithListingCount;
  },
});

export const getAllListings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;
    const admin = await ctx.db.get(userId);
    if (!admin) return null;
    await requireAdmin(ctx, admin._id);

    const listings = await ctx.db.query("listings").order("desc").take(500);
    const listingsWithSellers = await Promise.all(
      listings.map(async (listing) => {
        const seller = await ctx.db.get(listing.sellerId);
        let thumbnailUrl: string | null = null;
        if (listing.images.length > 0) {
          const firstImage = listing.images[0];
          thumbnailUrl = firstImage.startsWith("http")
            ? firstImage
            : await ctx.storage.getUrl(firstImage as Id<"_storage">);
        }
        return { ...listing, seller, imageUrls: thumbnailUrl ? [thumbnailUrl] : [] };
      })
    );
    return listingsWithSellers;
  },
});

export const getFlaggedListings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;
    const admin = await ctx.db.get(userId);
    if (!admin) return null;
    await requireAdmin(ctx, admin._id);

    const listings = await ctx.db
      .query("listings")
      .withIndex("by_moderation_status", (q) => q.eq("moderationStatus", "flagged"))
      .order("desc")
      .take(500);
    const listingsWithSellers = await Promise.all(
      listings.map(async (listing) => {
        const seller = await ctx.db.get(listing.sellerId);
        let thumbnailUrl: string | null = null;
        if (listing.images.length > 0) {
          const firstImage = listing.images[0];
          thumbnailUrl = firstImage.startsWith("http")
            ? firstImage
            : await ctx.storage.getUrl(firstImage as Id<"_storage">);
        }
        return { ...listing, seller, imageUrls: thumbnailUrl ? [thumbnailUrl] : [] };
      })
    );
    return listingsWithSellers;
  },
});

export const getAllReports = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;
    const admin = await ctx.db.get(userId);
    if (!admin) return null;
    await requireAdmin(ctx, admin._id);

    const reports = await ctx.db.query("reports").order("desc").take(200);
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
    const userId = await getUserId(ctx);
    if (!userId) return null;
    const admin = await ctx.db.get(userId);
    if (!admin) return null;
    await requireAdmin(ctx, admin._id);

    const logs = await ctx.db
      .query("moderationLogs")
      .withIndex("by_created")
      .order("desc")
      .take(50);
    const logsWithAdmin = await Promise.all(
      logs.map(async (log) => {
        const adminUser = await ctx.db.get(log.adminId);
        return { ...log, admin: adminUser };
      })
    );
    return logsWithAdmin;
  },
});

export const approveListing = mutation({
  args: {
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const admin = await getAuthenticatedUser(ctx);
    await requireAdmin(ctx, admin._id);

    await checkRateLimit(ctx, admin._id, "adminAction");

    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    await ctx.db.patch(args.listingId, {
      status: "active",
      moderationStatus: "clean",
      reviewedBy: admin._id,
      reviewedAt: Date.now(),
    });

    await ctx.db.insert("moderationLogs", {
      adminId: admin._id,
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
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await getAuthenticatedUser(ctx);
    await requireAdmin(ctx, admin._id);

    await checkRateLimit(ctx, admin._id, "adminAction");

    const reason = validateString(
      sanitizeInput(args.reason),
      "Rejection reason",
      VALIDATION.adminActionReason
    );

    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    await ctx.db.patch(args.listingId, {
      status: "rejected",
      moderationStatus: "rejected",
      reviewedBy: admin._id,
      reviewedAt: Date.now(),
    });

    await ctx.db.insert("moderationLogs", {
      adminId: admin._id,
      action: "reject_listing",
      targetType: "listing",
      targetId: args.listingId,
      reason,
      createdAt: Date.now(),
    });
  },
});

export const removeListing = mutation({
  args: {
    listingId: v.id("listings"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await getAuthenticatedUser(ctx);
    await requireAdmin(ctx, admin._id);

    await checkRateLimit(ctx, admin._id, "adminAction");

    const reason = validateString(
      sanitizeInput(args.reason),
      "Removal reason",
      VALIDATION.adminActionReason
    );

    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    await ctx.db.patch(args.listingId, {
      status: "removed",
      reviewedBy: admin._id,
      reviewedAt: Date.now(),
    });

    await ctx.db.insert("moderationLogs", {
      adminId: admin._id,
      action: "remove_listing",
      targetType: "listing",
      targetId: args.listingId,
      reason,
      createdAt: Date.now(),
    });
  },
});

export const banUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await getAuthenticatedUser(ctx);
    await requireAdmin(ctx, admin._id);

    await checkRateLimit(ctx, admin._id, "adminAction");

    const reason = validateString(
      sanitizeInput(args.reason),
      "Ban reason",
      VALIDATION.banReason
    );

    const { target } = await requireHigherRole(ctx, admin._id, args.userId);

    if (target.isBanned) {
      throw new Error("User is already banned");
    }

    await ctx.db.patch(args.userId, {
      isBanned: true,
      banReason: reason,
    });

    const userListings = await ctx.db
      .query("listings")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.userId))
      .collect();

    for (const listing of userListings) {
      await ctx.db.patch(listing._id, { status: "removed" });
    }

    await ctx.db.insert("moderationLogs", {
      adminId: admin._id,
      action: "ban_user",
      targetType: "user",
      targetId: args.userId,
      reason,
      createdAt: Date.now(),
    });
  },
});

export const unbanUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await getAuthenticatedUser(ctx);
    await requireAdmin(ctx, admin._id);
    await checkRateLimit(ctx, admin._id, "adminAction");

    const { target } = await requireHigherRole(ctx, admin._id, args.userId);

    if (!target.isBanned) {
      throw new Error("User is not banned");
    }

    await ctx.db.patch(args.userId, {
      isBanned: false,
      banReason: undefined,
    });

    await ctx.db.insert("moderationLogs", {
      adminId: admin._id,
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
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await getAuthenticatedUser(ctx);
    await requireAdmin(ctx, admin._id);
    await checkRateLimit(ctx, admin._id, "adminAction");

    const reason = validateString(
      sanitizeInput(args.reason),
      "Warning reason",
      VALIDATION.adminActionReason
    );

    const { target } = await requireHigherRole(ctx, admin._id, args.userId);

    await ctx.db.patch(args.userId, {
      warningCount: (target.warningCount || 0) + 1,
    });

    await ctx.db.insert("moderationLogs", {
      adminId: admin._id,
      action: "warn_user",
      targetType: "user",
      targetId: args.userId,
      reason,
      createdAt: Date.now(),
    });
  },
});

export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await getAuthenticatedUser(ctx);
    await requireSuperAdmin(ctx, admin._id);
    await checkRateLimit(ctx, admin._id, "adminAction");

    const role = validateEnum(args.role, "Role", ALLOWED_VALUES.userRoles);

    const { actor, target } = await requireHigherRole(ctx, admin._id, args.userId);

    const targetRoleLevel = getRoleLevel(role);
    const actorRoleLevel = getRoleLevel(actor.role);

    if (targetRoleLevel >= actorRoleLevel) {
      throw new Error("You cannot promote users to your level or higher");
    }

    const allSuperAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "super_admin"))
      .filter((q) => q.neq(q.field("isBanned"), true))
      .collect();

    if (allSuperAdmins.length <= 1 && target.role === "super_admin") {
      throw new Error("Cannot demote the last super admin");
    }

    await ctx.db.patch(args.userId, { role });

    await ctx.db.insert("moderationLogs", {
      adminId: admin._id,
      action: "set_role",
      targetType: "user",
      targetId: args.userId,
      metadata: JSON.stringify({ oldRole: target.role, newRole: role }),
      createdAt: Date.now(),
    });
  },
});

export const resolveReport = mutation({
  args: {
    reportId: v.id("reports"),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await getAuthenticatedUser(ctx);
    await requireAdmin(ctx, admin._id);
    await checkRateLimit(ctx, admin._id, "adminAction");

    const action = validateString(
      sanitizeInput(args.action),
      "Resolution action",
      { minLength: 1, maxLength: 100 }
    );

    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    await ctx.db.patch(args.reportId, {
      status: "resolved",
      resolvedBy: admin._id,
      resolvedAt: Date.now(),
    });

    await ctx.db.insert("moderationLogs", {
      adminId: admin._id,
      action: "resolve_report",
      targetType: "report",
      targetId: args.reportId,
      metadata: JSON.stringify({ action }),
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
    await requireActiveUser(ctx, args.reporterId);
    await checkRateLimit(ctx, args.reporterId, "createReport");

    const reason = validateString(
      sanitizeInput(args.reason),
      "Report reason",
      VALIDATION.reportReason
    );

    let description: string | undefined;
    if (args.description) {
      description = validateString(
        sanitizeInput(args.description),
        "Report description",
        { maxLength: VALIDATION.reportDescription.maxLength }
      );
    }

    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    if (listing.sellerId === args.reporterId) {
      throw new Error("You cannot report your own listing");
    }

    const existingReport = await ctx.db
      .query("reports")
      .withIndex("by_listing", (q) => q.eq("listingId", args.listingId))
      .filter((q) => q.eq(q.field("reporterId"), args.reporterId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingReport) {
      throw new Error("You have already reported this listing");
    }

    await ctx.db.insert("reports", {
      listingId: args.listingId,
      reporterId: args.reporterId,
      reason,
      description,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});
