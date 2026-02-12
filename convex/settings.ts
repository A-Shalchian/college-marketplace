import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  requireAdmin,
  checkRateLimit,
  validateString,
  validateEnum,
  VALIDATION,
  sanitizeInput,
  getAuthenticatedUser,
} from "./security";

const ALLOWED_SETTINGS_KEYS = [
  "moderation_blocklist",
  "site_announcement",
  "maintenance_mode",
  "max_listings_per_user",
  "featured_categories",
] as const;

type AllowedSettingsKey = typeof ALLOWED_SETTINGS_KEYS[number];

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    if (!ALLOWED_SETTINGS_KEYS.includes(args.key as AllowedSettingsKey)) {
      return null;
    }

    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (!setting?.value) return null;

    try {
      return JSON.parse(setting.value);
    } catch {
      return null;
    }
  },
});

export const set = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await getAuthenticatedUser(ctx);
    await requireAdmin(ctx, admin._id);

    await checkRateLimit(ctx, admin._id, "updateSettings");

    if (!ALLOWED_SETTINGS_KEYS.includes(args.key as AllowedSettingsKey)) {
      throw new Error(`Invalid settings key: "${args.key}". Use a valid settings key.`);
    }

    validateString(args.key, "Settings key", VALIDATION.settingsKey);
    validateString(args.value, "Settings value", VALIDATION.settingsValue);

    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(args.value);
    } catch {
      throw new Error("Settings value must be valid JSON");
    }

    if (args.key === "max_listings_per_user") {
      if (typeof parsedValue !== "number" || parsedValue < 1 || parsedValue > 100 || !Number.isInteger(parsedValue)) {
        throw new Error("max_listings_per_user must be an integer between 1 and 100");
      }
    } else if (args.key === "maintenance_mode") {
      if (typeof parsedValue !== "boolean") {
        throw new Error("maintenance_mode must be a boolean (true or false)");
      }
    } else if (args.key === "site_announcement") {
      if (typeof parsedValue !== "string" || parsedValue.length > 500) {
        throw new Error("site_announcement must be a string with maximum 500 characters");
      }
    } else if (args.key === "featured_categories") {
      if (!Array.isArray(parsedValue) || parsedValue.length > 10) {
        throw new Error("featured_categories must be an array with maximum 10 items");
      }
      if (!parsedValue.every((item) => typeof item === "string" && item.length <= 50)) {
        throw new Error("Each featured category must be a string with maximum 50 characters");
      }
    }

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("settings", {
        key: args.key,
        value: args.value,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getBlocklist = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "moderation_blocklist"))
      .unique();

    if (!setting) {
      return {
        drugs: [],
        sexual: [],
        weapons: [],
        scam: [],
        coded: [],
      };
    }

    return JSON.parse(setting.value);
  },
});

const ALLOWED_BLOCKLIST_CATEGORIES = ["drugs", "sexual", "weapons", "scam", "coded"] as const;
type BlocklistCategory = typeof ALLOWED_BLOCKLIST_CATEGORIES[number];

export const updateBlocklist = mutation({
  args: {
    category: v.string(),
    keywords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await getAuthenticatedUser(ctx);
    await requireAdmin(ctx, admin._id);

    await checkRateLimit(ctx, admin._id, "updateSettings");

    if (!ALLOWED_BLOCKLIST_CATEGORIES.includes(args.category as BlocklistCategory)) {
      throw new Error(
        `Invalid category: "${args.category}". Allowed: ${ALLOWED_BLOCKLIST_CATEGORIES.join(", ")}`
      );
    }

    if (args.keywords.length > 500) {
      throw new Error("Maximum 500 keywords allowed per category");
    }

    const sanitizedKeywords = args.keywords.map((keyword) => {
      const sanitized = sanitizeInput(keyword).toLowerCase();
      if (sanitized.length === 0 || sanitized.length > 50) {
        throw new Error("Each keyword must be 1-50 characters");
      }
      return sanitized;
    });

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "moderation_blocklist"))
      .unique();

    let blocklist = {
      drugs: [] as string[],
      sexual: [] as string[],
      weapons: [] as string[],
      scam: [] as string[],
      coded: [] as string[],
    };

    if (existing) {
      blocklist = JSON.parse(existing.value);
    }

    blocklist[args.category as BlocklistCategory] = sanitizedKeywords;

    const value = JSON.stringify(blocklist);

    if (existing) {
      await ctx.db.patch(existing._id, { value, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("settings", {
        key: "moderation_blocklist",
        value,
        updatedAt: Date.now(),
      });
    }
  },
});

export const initializeBlocklist = mutation({
  args: {},
  handler: async (ctx) => {
    const admin = await getAuthenticatedUser(ctx);
    await requireAdmin(ctx, admin._id);

    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "moderation_blocklist"))
      .unique();

    if (existing) {
      return { status: "already_initialized" };
    }

    const blocklist = {
      drugs: [
        "weed", "marijuana", "cannabis", "420", "blunt", "joint", "edibles",
        "coke", "cocaine", "crack", "heroin", "meth", "molly", "mdma", "ecstasy",
        "lsd", "acid", "shrooms", "mushrooms", "ketamine", "xanax", "percs",
        "percocet", "oxy", "oxycodone", "fentanyl", "pills", "benzos",
        "plug", "dealer", "gas", "pack", "za", "zaza", "loud", "dope"
      ],
      sexual: [
        "escort", "escorts", "hooker", "prostitute", "prostitution",
        "hookup", "hook up", "fwb", "friends with benefits", "nsa", "no strings",
        "sugar daddy", "sugar baby", "sugardaddy", "sugarbaby", "sugar mama",
        "massage", "full service", "happy ending", "gfe", "girlfriend experience",
        "companionship", "companion", "overnight", "incall", "outcall",
        "onlyfans", "of link", "premium snap", "private snap"
      ],
      weapons: [
        "gun", "guns", "firearm", "pistol", "glock", "9mm", "rifle",
        "ar15", "ar-15", "ak47", "ak-47", "shotgun", "ammo", "ammunition",
        "piece", "strap", "heat", "burner", "switch", "auto sear"
      ],
      scam: [
        "wire transfer", "western union", "moneygram", "bitcoin only",
        "crypto only", "gift cards", "itunes cards", "steam cards",
        "advance payment", "pay first", "deposit required"
      ],
      coded: [
        "party favors", "party supplies", "ski trip", "skiing",
        "ice cream", "snow", "trees", "green", "herbs",
        "diamonds", "rocks", "crystal", "glass",
        "roses", "donations", "generous"
      ],
    };

    await ctx.db.insert("settings", {
      key: "moderation_blocklist",
      value: JSON.stringify(blocklist),
      updatedAt: Date.now(),
    });

    return { status: "initialized" };
  },
});
