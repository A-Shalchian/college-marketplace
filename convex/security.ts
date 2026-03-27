import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id, Doc } from "./_generated/dataModel";
import { internalMutation } from "./_generated/server";

export const RATE_LIMITS = {
  createListing: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
  updateListing: { windowMs: 60 * 1000, maxRequests: 10 },
  deleteListing: { windowMs: 60 * 1000, maxRequests: 5 },

  sendMessage: { windowMs: 60 * 1000, maxRequests: 30 },
  createConversation: { windowMs: 60 * 1000, maxRequests: 10 },

  generateUploadUrl: { windowMs: 60 * 1000, maxRequests: 20 },

  createReport: { windowMs: 60 * 60 * 1000, maxRequests: 5 },

  adminAction: { windowMs: 60 * 1000, maxRequests: 30 },

  updateSettings: { windowMs: 60 * 1000, maxRequests: 5 },

  updateUser: { windowMs: 60 * 1000, maxRequests: 10 },

  contactMessage: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
} as const;

export type RateLimitAction = keyof typeof RATE_LIMITS;

export async function checkRateLimit(
  ctx: MutationCtx,
  identifier: string,
  action: RateLimitAction
): Promise<void> {
  const config = RATE_LIMITS[action];
  const key = `${action}:${identifier}`;
  const now = Date.now();

  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first();

  if (!existing || now - existing.windowStart > config.windowMs) {
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    await ctx.db.insert("rateLimits", {
      key,
      count: 1,
      windowStart: now,
      expiresAt: now + config.windowMs,
    });
    return;
  }

  if (existing.count >= config.maxRequests) {
    const resetTime = Math.ceil((existing.windowStart + config.windowMs - now) / 1000);
    throw new Error(
      `Rate limit exceeded for ${action}. Please try again in ${resetTime} seconds. ` +
      `(Max ${config.maxRequests} requests per ${config.windowMs / 1000}s)`
    );
  }

  await ctx.db.patch(existing._id, { count: existing.count + 1 });
}

export async function cleanupRateLimits(ctx: MutationCtx): Promise<number> {
  const now = Date.now();
  const expired = await ctx.db
    .query("rateLimits")
    .withIndex("by_expires", (q) => q.lt("expiresAt", now))
    .collect();

  await Promise.all(expired.map((record) => ctx.db.delete(record._id)));
  return expired.length;
}

export async function getUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  return user?._id ?? null;
}

export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
  adminId: Id<"users">
): Promise<Doc<"users">> {
  const admin = await ctx.db.get(adminId);

  if (!admin) {
    throw new Error("Unauthorized: Admin user not found");
  }

  if (admin.role !== "admin" && admin.role !== "super_admin") {
    throw new Error("Unauthorized: Admin privileges required");
  }

  if (admin.isBanned) {
    throw new Error("Unauthorized: This admin account has been suspended");
  }

  return admin;
}

export async function requireSuperAdmin(
  ctx: QueryCtx | MutationCtx,
  adminId: Id<"users">
): Promise<Doc<"users">> {
  const admin = await ctx.db.get(adminId);

  if (!admin) {
    throw new Error("Unauthorized: Super admin user not found");
  }

  if (admin.role !== "super_admin") {
    throw new Error("Unauthorized: Super admin privileges required");
  }

  if (admin.isBanned) {
    throw new Error("Unauthorized: This admin account has been suspended");
  }

  return admin;
}

export async function requireListingOwner(
  ctx: QueryCtx | MutationCtx,
  listingId: Id<"listings">,
  userId: Id<"users">
): Promise<Doc<"listings">> {
  const listing = await ctx.db.get(listingId);

  if (!listing) {
    throw new Error("Listing not found");
  }

  if (listing.sellerId !== userId) {
    throw new Error("Unauthorized: You can only modify your own listings");
  }

  return listing;
}

export async function requireConversationParticipant(
  ctx: QueryCtx | MutationCtx,
  conversationId: Id<"conversations">,
  userId: Id<"users">
): Promise<Doc<"conversations">> {
  const conversation = await ctx.db.get(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.buyerId !== userId && conversation.sellerId !== userId) {
    throw new Error("Unauthorized: You are not a participant in this conversation");
  }

  return conversation;
}

export async function requireActiveUser(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
): Promise<Doc<"users">> {
  const user = await ctx.db.get(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isBanned) {
    throw new Error("Your account has been suspended. Reason: " + (user.banReason || "Policy violation"));
  }

  return user;
}

export async function getAuthenticatedUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized: You must be logged in");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found. Please refresh the page.");
  }

  if (user.isBanned) {
    throw new Error("Your account has been suspended. Reason: " + (user.banReason || "Policy violation"));
  }

  return user;
}

const ROLE_HIERARCHY = {
  super_admin: 3,
  admin: 2,
  moderator: 1,
  user: 0,
} as const;

export function getRoleLevel(role: string | undefined): number {
  return ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY] ?? 0;
}

export async function requireHigherRole(
  ctx: QueryCtx | MutationCtx,
  actorId: Id<"users">,
  targetId: Id<"users">
): Promise<{ actor: Doc<"users">; target: Doc<"users"> }> {
  const actor = await ctx.db.get(actorId);
  const target = await ctx.db.get(targetId);

  if (!actor) throw new Error("Actor user not found");
  if (!target) throw new Error("Target user not found");

  const actorLevel = getRoleLevel(actor.role);
  const targetLevel = getRoleLevel(target.role);

  if (actorId === targetId) {
    throw new Error("You cannot perform this action on yourself");
  }

  if (actorLevel <= targetLevel) {
    throw new Error("You can only perform actions on users with lower roles than yours");
  }

  return { actor, target };
}

export const VALIDATION = {
  title: { minLength: 3, maxLength: 100 },
  description: { minLength: 10, maxLength: 5000 },
  price: { min: 0, max: 100000 },
  images: { maxCount: 10 },
  imageSize: { maxBytes: 2 * 1024 * 1024 },
  imageDimensions: { maxWidth: 4096, maxHeight: 4096 },

  messageContent: { minLength: 1, maxLength: 2000 },

  reportReason: { minLength: 5, maxLength: 500 },
  reportDescription: { maxLength: 2000 },

  userName: { minLength: 1, maxLength: 100 },
  userEmail: { maxLength: 254 },

  banReason: { minLength: 5, maxLength: 500 },
  adminActionReason: { minLength: 5, maxLength: 500 },

  settingsKey: { maxLength: 100 },
  settingsValue: { maxLength: 50000 },
} as const;

export const ALLOWED_VALUES = {
  categories: [
    "textbooks",
    "electronics",
    "furniture",
    "clothing",
    "transportation",
    "other",
  ],
  conditions: [
    "New",
    "Like New",
    "Good",
    "Fair",
  ],
  imageTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ],
  campuses: [
    "St. James Campus",
    "Casa Loma Campus",
    "Waterfront Campus",
  ],
  listingStatuses: [
    "active",
    "sold",
    "removed",
    "rejected",
    "draft",
  ],
  reportReasons: [
    "spam",
    "prohibited-item",
    "fraud",
    "inappropriate",
    "other",
  ],
  reportStatuses: [
    "pending",
    "resolved",
    "dismissed",
  ],
  userRoles: [
    "user",
    "moderator",
    "admin",
    "super_admin",
  ],
  adminActions: [
    "approve_listing",
    "reject_listing",
    "remove_listing",
    "ban_user",
    "unban_user",
    "warn_user",
    "set_role",
    "resolve_report",
  ],
} as const;

export function validateString(
  value: string,
  fieldName: string,
  constraints: { minLength?: number; maxLength?: number }
): string {
  const trimmed = value.trim();

  if (constraints.minLength !== undefined && trimmed.length < constraints.minLength) {
    throw new Error(
      `${fieldName} must be at least ${constraints.minLength} characters (got ${trimmed.length})`
    );
  }

  if (constraints.maxLength !== undefined && trimmed.length > constraints.maxLength) {
    throw new Error(
      `${fieldName} must be at most ${constraints.maxLength} characters (got ${trimmed.length})`
    );
  }

  return trimmed;
}

export function validateNumber(
  value: number,
  fieldName: string,
  constraints: { min?: number; max?: number }
): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a valid number`);
  }

  if (constraints.min !== undefined && value < constraints.min) {
    throw new Error(`${fieldName} must be at least ${constraints.min} (got ${value})`);
  }

  if (constraints.max !== undefined && value > constraints.max) {
    throw new Error(`${fieldName} must be at most ${constraints.max} (got ${value})`);
  }

  return value;
}

export function validateEnum<T extends string>(
  value: string,
  fieldName: string,
  allowedValues: readonly T[]
): T {
  if (!allowedValues.includes(value as T)) {
    throw new Error(
      `Invalid ${fieldName}: "${value}". Allowed values: ${allowedValues.join(", ")}`
    );
  }
  return value as T;
}

export function validateArray<T>(
  value: T[],
  fieldName: string,
  constraints: { maxCount?: number; minCount?: number }
): T[] {
  if (constraints.minCount !== undefined && value.length < constraints.minCount) {
    throw new Error(
      `${fieldName} must have at least ${constraints.minCount} items (got ${value.length})`
    );
  }

  if (constraints.maxCount !== undefined && value.length > constraints.maxCount) {
    throw new Error(
      `${fieldName} must have at most ${constraints.maxCount} items (got ${value.length})`
    );
  }

  return value;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/\0/g, "")
    .replace(/[\t\r]/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}

export function validateEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmed)) {
    throw new Error("Invalid email address format");
  }

  if (trimmed.length > VALIDATION.userEmail.maxLength) {
    throw new Error(`Email must be at most ${VALIDATION.userEmail.maxLength} characters`);
  }

  return trimmed;
}

export interface ListingInput {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  campus: string;
  images: string[];
}

export function validateListingInput(input: ListingInput): ListingInput {
  return {
    title: validateString(sanitizeInput(input.title), "Title", VALIDATION.title),
    description: validateString(sanitizeInput(input.description), "Description", VALIDATION.description),
    price: validateNumber(input.price, "Price", VALIDATION.price),
    category: validateEnum(input.category, "Category", ALLOWED_VALUES.categories),
    condition: validateEnum(input.condition, "Condition", ALLOWED_VALUES.conditions),
    campus: validateEnum(input.campus, "Campus", ALLOWED_VALUES.campuses),
    images: validateArray(input.images, "Images", VALIDATION.images),
  };
}

export function validateMessageContent(content: string): string {
  return validateString(sanitizeInput(content), "Message", VALIDATION.messageContent);
}

export interface ReportInput {
  reason: string;
  description?: string;
}

export function validateReportInput(input: ReportInput): ReportInput {
  return {
    reason: validateString(sanitizeInput(input.reason), "Reason", VALIDATION.reportReason),
    description: input.description
      ? validateString(sanitizeInput(input.description), "Description", { maxLength: VALIDATION.reportDescription.maxLength })
      : undefined,
  };
}

export function validateImageFile(file: { type: string; size: number; name: string }): void {
  if (!ALLOWED_VALUES.imageTypes.includes(file.type as typeof ALLOWED_VALUES.imageTypes[number])) {
    throw new Error(
      `Invalid file type "${file.type}". Only JPEG, PNG, and WebP images are allowed.`
    );
  }

  if (file.size > VALIDATION.imageSize.maxBytes) {
    const maxMB = VALIDATION.imageSize.maxBytes / (1024 * 1024);
    const actualMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(
      `File "${file.name}" is too large (${actualMB}MB). Maximum size is ${maxMB}MB.`
    );
  }

  if (file.size === 0) {
    throw new Error(`File "${file.name}" is empty.`);
  }
}

export const cleanupRateLimitsInternal = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await cleanupRateLimits(ctx);
  },
});
