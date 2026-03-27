import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { getAuthenticatedUser } from "./security";
import { moderateContent, Blocklist } from "./moderation";

async function getBlocklist(ctx: QueryCtx | MutationCtx): Promise<Blocklist> {
  const setting = await ctx.db
    .query("settings")
    .withIndex("by_key", (q) => q.eq("key", "moderation_blocklist"))
    .unique();

  if (!setting) {
    return { drugs: [], sexual: [], weapons: [], scam: [], coded: [] };
  }

  return JSON.parse(setting.value);
}

// ─── Queries ────────────────────────────────────────────────────────────────

export const getClubs = query({
  args: {
    category: v.optional(v.string()),
    campus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let clubs;

    if (args.category) {
      clubs = await ctx.db
        .query("clubs")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .order("desc")
        .take(100);
      clubs = clubs.filter((c) => c.category === args.category);
    } else {
      clubs = await ctx.db
        .query("clubs")
        .withIndex("by_status", (q) => q.eq("status", "active"))
        .order("desc")
        .take(100);
    }

    if (args.campus) {
      clubs = clubs.filter((c) => c.campus === args.campus);
    }

    const clubsWithCreators = await Promise.all(
      clubs.map(async (club) => {
        const creator = await ctx.db.get(club.creatorId);
        let imageUrl: string | null = null;
        if (club.imageId) {
          imageUrl = await ctx.storage.getUrl(club.imageId as Id<"_storage">);
        }
        return {
          ...club,
          imageUrl,
          creator: creator
            ? { _id: creator._id, name: creator.name, imageUrl: creator.imageUrl }
            : null,
        };
      })
    );

    return clubsWithCreators;
  },
});

export const getClubById = query({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const club = await ctx.db.get(args.clubId);
    if (!club) return null;

    const creator = await ctx.db.get(club.creatorId);
    let imageUrl: string | null = null;
    if (club.imageId) {
      imageUrl = await ctx.storage.getUrl(club.imageId as Id<"_storage">);
    }

    return {
      ...club,
      imageUrl,
      creator: creator
        ? { _id: creator._id, name: creator.name, imageUrl: creator.imageUrl }
        : null,
    };
  },
});

export const getClubMembers = query({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("clubMembers")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();

    const membersWithUsers = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          user: user
            ? { _id: user._id, name: user.name, imageUrl: user.imageUrl }
            : null,
        };
      })
    );

    return membersWithUsers;
  },
});

export const getUserClubs = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("clubMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const clubs = await Promise.all(
      memberships.map(async (m) => {
        const club = await ctx.db.get(m.clubId);
        return club && club.status === "active" ? { ...club, role: m.role } : null;
      })
    );

    return clubs.filter(Boolean);
  },
});

export const isMember = query({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const membership = await ctx.db
      .query("clubMembers")
      .withIndex("by_club_and_user", (q) =>
        q.eq("clubId", args.clubId).eq("userId", user._id)
      )
      .first();

    return membership || null;
  },
});

export const getClubPosts = query({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("forumPosts")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .order("desc")
      .collect();

    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
          author: author
            ? { _id: author._id, name: author.name, imageUrl: author.imageUrl }
            : null,
        };
      })
    );

    return postsWithAuthors;
  },
});

// ─── Mutations ──────────────────────────────────────────────────────────────

export const createClub = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    campus: v.string(),
    category: v.string(),
    imageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const name = args.name.trim();
    const description = args.description.trim();

    if (name.length < 3 || name.length > 100) {
      throw new Error("Club name must be between 3 and 100 characters");
    }
    if (description.length < 10 || description.length > 5000) {
      throw new Error("Description must be between 10 and 5,000 characters");
    }

    const blocklist = await getBlocklist(ctx);
    const moderation = moderateContent(name, description, blocklist);

    if (moderation.status === "rejected") {
      throw new Error(
        "Your club contains content that violates our community guidelines and cannot be created."
      );
    }

    const clubId = await ctx.db.insert("clubs", {
      creatorId: user._id,
      name,
      description,
      campus: args.campus,
      category: args.category,
      imageId: args.imageId,
      memberCount: 1,
      status: "active",
      createdAt: Date.now(),
    });

    await ctx.db.insert("clubMembers", {
      clubId,
      userId: user._id,
      role: "admin",
      joinedAt: Date.now(),
    });

    return clubId;
  },
});

export const joinClub = mutation({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const club = await ctx.db.get(args.clubId);
    if (!club || club.status !== "active") throw new Error("Club not found");

    const existing = await ctx.db
      .query("clubMembers")
      .withIndex("by_club_and_user", (q) =>
        q.eq("clubId", args.clubId).eq("userId", user._id)
      )
      .first();

    if (existing) throw new Error("You are already a member of this club");

    await ctx.db.insert("clubMembers", {
      clubId: args.clubId,
      userId: user._id,
      role: "member",
      joinedAt: Date.now(),
    });

    await ctx.db.patch(args.clubId, {
      memberCount: club.memberCount + 1,
    });
  },
});

export const leaveClub = mutation({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const club = await ctx.db.get(args.clubId);
    if (!club) throw new Error("Club not found");

    if (club.creatorId === user._id) {
      throw new Error("Club creator cannot leave. Delete the club instead.");
    }

    const membership = await ctx.db
      .query("clubMembers")
      .withIndex("by_club_and_user", (q) =>
        q.eq("clubId", args.clubId).eq("userId", user._id)
      )
      .first();

    if (!membership) throw new Error("You are not a member of this club");

    await ctx.db.delete(membership._id);

    await ctx.db.patch(args.clubId, {
      memberCount: Math.max(0, club.memberCount - 1),
    });
  },
});

export const deleteClub = mutation({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const club = await ctx.db.get(args.clubId);
    if (!club) throw new Error("Club not found");

    const isAdmin = user.role === "admin" || user.role === "super_admin";
    if (club.creatorId !== user._id && !isAdmin) {
      throw new Error("Only the club creator or a site admin can delete this club");
    }

    // Cascade delete members
    const members = await ctx.db
      .query("clubMembers")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // Patch posts to remove clubId (keeps them in general forums)
    const posts = await ctx.db
      .query("forumPosts")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();

    for (const post of posts) {
      await ctx.db.patch(post._id, { clubId: undefined });
    }

    await ctx.db.delete(args.clubId);
  },
});

export const updateClub = mutation({
  args: {
    clubId: v.id("clubs"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    imageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const club = await ctx.db.get(args.clubId);
    if (!club) throw new Error("Club not found");

    const isAdmin = user.role === "admin" || user.role === "super_admin";
    if (club.creatorId !== user._id && !isAdmin) {
      throw new Error("Only the club creator or a site admin can update this club");
    }

    const updates: Record<string, unknown> = {};

    if (args.name !== undefined) {
      const name = args.name.trim();
      if (name.length < 3 || name.length > 100) {
        throw new Error("Club name must be between 3 and 100 characters");
      }
      updates.name = name;
    }

    if (args.description !== undefined) {
      const description = args.description.trim();
      if (description.length < 10 || description.length > 5000) {
        throw new Error("Description must be between 10 and 5,000 characters");
      }
      updates.description = description;
    }

    if (args.imageId !== undefined) {
      updates.imageId = args.imageId;
    }

    if (Object.keys(updates).length > 0) {
      const blocklist = await getBlocklist(ctx);
      const moderation = moderateContent(
        (updates.name as string) || club.name,
        (updates.description as string) || club.description,
        blocklist
      );

      if (moderation.status === "rejected") {
        throw new Error(
          "Your update contains content that violates our community guidelines."
        );
      }

      await ctx.db.patch(args.clubId, updates);
    }
  },
});

export const createClubPost = mutation({
  args: {
    clubId: v.id("clubs"),
    title: v.string(),
    content: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const club = await ctx.db.get(args.clubId);
    if (!club || club.status !== "active") throw new Error("Club not found");

    // Check membership
    const membership = await ctx.db
      .query("clubMembers")
      .withIndex("by_club_and_user", (q) =>
        q.eq("clubId", args.clubId).eq("userId", user._id)
      )
      .first();

    if (!membership) throw new Error("You must be a club member to post");

    const title = args.title.trim();
    const content = args.content.trim();

    if (title.length < 3 || title.length > 200) {
      throw new Error("Title must be between 3 and 200 characters");
    }
    if (content.length < 10 || content.length > 10000) {
      throw new Error("Content must be between 10 and 10,000 characters");
    }

    const blocklist = await getBlocklist(ctx);
    const moderation = moderateContent(title, content, blocklist);

    if (moderation.status === "rejected") {
      throw new Error(
        "Your post contains content that violates our community guidelines."
      );
    }

    const postId = await ctx.db.insert("forumPosts", {
      authorId: user._id,
      clubId: args.clubId,
      title,
      content,
      category: args.category,
      isPinned: false,
      replyCount: 0,
      likeCount: 0,
      createdAt: Date.now(),
    });

    return postId;
  },
});
