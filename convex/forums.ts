import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthenticatedUser, requireActiveUser, requireAdmin } from "./security";
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

export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
    campus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

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
        "Your post contains content that violates our community guidelines and cannot be published."
      );
    }

    const postId = await ctx.db.insert("forumPosts", {
      authorId: user._id,
      title,
      content,
      category: args.category,
      campus: args.campus,
      isPinned: false,
      replyCount: 0,
      likeCount: 0,
      createdAt: Date.now(),
    });

    return postId;
  },
});

export const getPosts = query({
  args: {
    category: v.optional(v.string()),
    campus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let posts;

    if (args.category) {
      posts = await ctx.db
        .query("forumPosts")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .take(100);
    } else {
      posts = await ctx.db
        .query("forumPosts")
        .withIndex("by_created")
        .order("desc")
        .take(100);
    }

    if (args.campus) {
      posts = posts.filter((p) => p.campus === args.campus);
    }

    const pinned = posts.filter((p) => p.isPinned);
    const unpinned = posts.filter((p) => !p.isPinned);
    const sorted = [...pinned, ...unpinned];

    const postsWithAuthors = await Promise.all(
      sorted.map(async (post) => {
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

export const getPostById = query({
  args: { postId: v.id("forumPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;

    const author = await ctx.db.get(post.authorId);

    return {
      ...post,
      author: author
        ? { _id: author._id, name: author.name, imageUrl: author.imageUrl }
        : null,
    };
  },
});

export const getReplies = query({
  args: { postId: v.id("forumPosts") },
  handler: async (ctx, args) => {
    const replies = await ctx.db
      .query("forumReplies")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("asc")
      .collect();

    const repliesWithAuthors = await Promise.all(
      replies.map(async (reply) => {
        const author = await ctx.db.get(reply.authorId);
        return {
          ...reply,
          author: author
            ? { _id: author._id, name: author.name, imageUrl: author.imageUrl }
            : null,
        };
      })
    );

    return repliesWithAuthors;
  },
});

export const createReply = mutation({
  args: {
    postId: v.id("forumPosts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const content = args.content.trim();
    if (content.length < 1 || content.length > 5000) {
      throw new Error("Reply must be between 1 and 5,000 characters");
    }

    const blocklist = await getBlocklist(ctx);
    const moderation = moderateContent("", content, blocklist);

    if (moderation.status === "rejected") {
      throw new Error(
        "Your reply contains content that violates our community guidelines."
      );
    }

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const replyId = await ctx.db.insert("forumReplies", {
      postId: args.postId,
      authorId: user._id,
      content,
      likeCount: 0,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.postId, {
      replyCount: post.replyCount + 1,
    });

    return replyId;
  },
});

export const togglePostLike = mutation({
  args: { postId: v.id("forumPosts") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const existing = await ctx.db
      .query("forumLikes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .first();

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, {
        likeCount: Math.max(0, post.likeCount - 1),
      });
      return false;
    } else {
      await ctx.db.insert("forumLikes", {
        userId: user._id,
        postId: args.postId,
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.postId, {
        likeCount: post.likeCount + 1,
      });
      return true;
    }
  },
});

export const toggleReplyLike = mutation({
  args: { replyId: v.id("forumReplies") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const existing = await ctx.db
      .query("forumLikes")
      .withIndex("by_user_and_reply", (q) =>
        q.eq("userId", user._id).eq("replyId", args.replyId)
      )
      .first();

    const reply = await ctx.db.get(args.replyId);
    if (!reply) throw new Error("Reply not found");

    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.replyId, {
        likeCount: Math.max(0, reply.likeCount - 1),
      });
      return false;
    } else {
      await ctx.db.insert("forumLikes", {
        userId: user._id,
        replyId: args.replyId,
        createdAt: Date.now(),
      });
      await ctx.db.patch(args.replyId, {
        likeCount: reply.likeCount + 1,
      });
      return true;
    }
  },
});

export const hasLikedPost = query({
  args: {
    postId: v.id("forumPosts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query("forumLikes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", args.userId).eq("postId", args.postId)
      )
      .first();
    return !!like;
  },
});

export const hasLikedReply = query({
  args: {
    replyId: v.id("forumReplies"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query("forumLikes")
      .withIndex("by_user_and_reply", (q) =>
        q.eq("userId", args.userId).eq("replyId", args.replyId)
      )
      .first();
    return !!like;
  },
});

export const getUserLikedPostIds = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("forumLikes")
      .withIndex("by_user_and_post", (q) => q.eq("userId", args.userId))
      .collect();
    return likes
      .filter((l) => l.postId !== undefined)
      .map((l) => l.postId!);
  },
});

export const togglePin = mutation({
  args: {
    postId: v.id("forumPosts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.userId);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    await ctx.db.patch(args.postId, {
      isPinned: !post.isPinned,
    });

    return !post.isPinned;
  },
});

export const editPost = mutation({
  args: {
    postId: v.id("forumPosts"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const isAdmin = user.role === "admin" || user.role === "super_admin";
    if (post.authorId !== user._id && !isAdmin) {
      throw new Error("You can only edit your own posts");
    }

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
        "Your edit contains content that violates our community guidelines."
      );
    }

    await ctx.db.patch(args.postId, { title, content });
  },
});

export const editReply = mutation({
  args: {
    replyId: v.id("forumReplies"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const reply = await ctx.db.get(args.replyId);
    if (!reply) throw new Error("Reply not found");

    const isAdmin = user.role === "admin" || user.role === "super_admin";
    if (reply.authorId !== user._id && !isAdmin) {
      throw new Error("You can only edit your own replies");
    }

    const content = args.content.trim();
    if (content.length < 1 || content.length > 5000) {
      throw new Error("Reply must be between 1 and 5,000 characters");
    }

    const blocklist = await getBlocklist(ctx);
    const moderation = moderateContent("", content, blocklist);

    if (moderation.status === "rejected") {
      throw new Error(
        "Your edit contains content that violates our community guidelines."
      );
    }

    await ctx.db.patch(args.replyId, { content });
  },
});

export const deletePost = mutation({
  args: {
    postId: v.id("forumPosts"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireActiveUser(ctx, args.userId);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const user = await ctx.db.get(args.userId);
    const isAdmin = user?.role === "admin" || user?.role === "super_admin";

    if (post.authorId !== args.userId && !isAdmin) {
      throw new Error("You can only delete your own posts");
    }

    const replies = await ctx.db
      .query("forumReplies")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const reply of replies) {
      const replyLikes = await ctx.db
        .query("forumLikes")
        .withIndex("by_user_and_reply", (q) => q.eq("userId", reply.authorId).eq("replyId", reply._id))
        .collect();
      for (const like of replyLikes) {
        await ctx.db.delete(like._id);
      }
      await ctx.db.delete(reply._id);
    }

    const postLikes = await ctx.db
      .query("forumLikes")
      .withIndex("by_user_and_post", (q) => q.eq("userId", post.authorId).eq("postId", args.postId))
      .collect();
    for (const like of postLikes) {
      await ctx.db.delete(like._id);
    }

    await ctx.db.delete(args.postId);
  },
});

export const deleteReply = mutation({
  args: {
    replyId: v.id("forumReplies"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireActiveUser(ctx, args.userId);

    const reply = await ctx.db.get(args.replyId);
    if (!reply) throw new Error("Reply not found");

    const user = await ctx.db.get(args.userId);
    const isAdmin = user?.role === "admin" || user?.role === "super_admin";

    if (reply.authorId !== args.userId && !isAdmin) {
      throw new Error("You can only delete your own replies");
    }

    const post = await ctx.db.get(reply.postId);
    if (post) {
      await ctx.db.patch(reply.postId, {
        replyCount: Math.max(0, post.replyCount - 1),
      });
    }

    await ctx.db.delete(args.replyId);
  },
});
