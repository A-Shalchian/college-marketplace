import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
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
    const admin = await getAuthenticatedUser(ctx);
    await requireAdmin(ctx, admin._id);

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
    const admin = await getAuthenticatedUser(ctx);
    await requireAdmin(ctx, admin._id);

    const users = await ctx.db.query("users").order("desc").take(200);
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
    const admin = await getAuthenticatedUser(ctx);
    await requireAdmin(ctx, admin._id);

    const listings = await ctx.db.query("listings").order("desc").take(500);
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
    const admin = await getAuthenticatedUser(ctx);
    await requireAdmin(ctx, admin._id);

    const listings = await ctx.db
      .query("listings")
      .withIndex("by_moderation_status", (q) => q.eq("moderationStatus", "flagged"))
      .order("desc")
      .take(500);
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
    const admin = await getAuthenticatedUser(ctx);
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
    const admin = await getAuthenticatedUser(ctx);
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
