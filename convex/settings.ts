import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    return setting?.value ? JSON.parse(setting.value) : null;
  },
});

export const set = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
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

export const updateBlocklist = mutation({
  args: {
    category: v.string(),
    keywords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
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

    blocklist[args.category as keyof typeof blocklist] = args.keywords;

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
