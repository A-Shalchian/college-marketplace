"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { usePreloadedQuery } from "convex/react";
import type { Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  ThumbsUp,
  MessageCircle,
  Pin,
  Trash2,
  User,
  Send,
  MapPin,
  Pencil,
  X,
} from "lucide-react";

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function PostContent({
  preloadedPost,
}: {
  preloadedPost: Preloaded<typeof api.forums.getPostById>;
}) {
  const { isAuthenticated } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  const post = usePreloadedQuery(preloadedPost);
  const postId = post?._id;
  const replies = useQuery(
    api.forums.getReplies,
    postId ? { postId } : "skip"
  );
  const hasLiked = useQuery(
    api.forums.hasLikedPost,
    currentUser && postId
      ? { postId, userId: currentUser._id }
      : "skip"
  );

  const togglePostLike = useMutation(api.forums.togglePostLike);
  const toggleReplyLike = useMutation(api.forums.toggleReplyLike);
  const createReply = useMutation(api.forums.createReply);
  const deletePost = useMutation(api.forums.deletePost);
  const deleteReply = useMutation(api.forums.deleteReply);
  const togglePin = useMutation(api.forums.togglePin);
  const editPost = useMutation(api.forums.editPost);
  const editReply = useMutation(api.forums.editReply);

  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState("");
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostError, setEditPostError] = useState("");
  const [isEditPostSubmitting, setIsEditPostSubmitting] = useState(false);

  const [editingReplyId, setEditingReplyId] = useState<Id<"forumReplies"> | null>(null);
  const [editReplyContent, setEditReplyContent] = useState("");
  const [editReplyError, setEditReplyError] = useState("");
  const [isEditReplySubmitting, setIsEditReplySubmitting] = useState(false);

  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "super_admin";
  const isAuthor = currentUser && post?.authorId === currentUser._id;

  const handleLikePost = async () => {
    if (!currentUser || !postId) return;
    await togglePostLike({ postId });
  };

  const handleLikeReply = async (replyId: Id<"forumReplies">) => {
    if (!currentUser) return;
    await toggleReplyLike({ replyId });
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !replyContent.trim() || isSubmitting || !postId) return;

    setIsSubmitting(true);
    try {
      await createReply({
        postId,
        content: replyContent.trim(),
      });
      setReplyContent("");
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!currentUser || !postId) return;
    if (!confirm("Are you sure you want to delete this post?")) return;
    await deletePost({ postId, userId: currentUser._id });
    window.location.href = "/community/forums";
  };

  const handleDeleteReply = async (replyId: Id<"forumReplies">) => {
    if (!currentUser) return;
    if (!confirm("Delete this reply?")) return;
    await deleteReply({ replyId, userId: currentUser._id });
  };

  const handleTogglePin = async () => {
    if (!currentUser || !postId) return;
    await togglePin({ postId, userId: currentUser._id });
  };

  const openEditPost = () => {
    if (!post) return;
    setEditPostTitle(post.title);
    setEditPostContent(post.content);
    setEditPostError("");
    setIsEditingPost(true);
  };

  const handleEditPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId || isEditPostSubmitting) return;

    setEditPostError("");
    if (editPostTitle.trim().length < 3) {
      setEditPostError("Title must be at least 3 characters");
      return;
    }
    if (editPostContent.trim().length < 10) {
      setEditPostError("Content must be at least 10 characters");
      return;
    }

    setIsEditPostSubmitting(true);
    try {
      await editPost({
        postId,
        title: editPostTitle.trim(),
        content: editPostContent.trim(),
      });
      setIsEditingPost(false);
    } catch (err) {
      setEditPostError(err instanceof Error ? err.message : "Failed to edit post");
    }
    setIsEditPostSubmitting(false);
  };

  const openEditReply = (replyId: Id<"forumReplies">, content: string) => {
    setEditingReplyId(replyId);
    setEditReplyContent(content);
    setEditReplyError("");
  };

  const handleEditReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReplyId || isEditReplySubmitting) return;

    setEditReplyError("");
    if (editReplyContent.trim().length < 1) {
      setEditReplyError("Reply cannot be empty");
      return;
    }

    setIsEditReplySubmitting(true);
    try {
      await editReply({
        replyId: editingReplyId,
        content: editReplyContent.trim(),
      });
      setEditingReplyId(null);
    } catch (err) {
      setEditReplyError(err instanceof Error ? err.message : "Failed to edit reply");
    }
    setIsEditReplySubmitting(false);
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      general: "General",
      course_help: "Course Help",
      housing: "Housing",
      campus_life: "Campus Life",
    };
    return labels[cat] || cat;
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      general: "bg-primary/10 text-primary",
      course_help: "bg-accent-mint/10 text-accent-mint",
      housing: "bg-accent-coral/10 text-accent-coral",
      campus_life: "bg-primary/10 text-muted-foreground",
    };
    return (
      colors[cat] ||
      "bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground"
    );
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-[900px] mx-auto px-6 py-20 text-center">
          <p className="text-gray-500">Post not found</p>
          <Link
            href="/community/forums"
            className="text-primary hover:underline mt-4 block font-semibold"
          >
            Back to forums
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[900px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/community/forums"
            className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm text-muted-foreground">Back to forums</span>
        </div>

        <article className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-6 md:p-8 mb-6">
          {isEditingPost ? (
            <form onSubmit={handleEditPostSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={editPostTitle}
                  onChange={(e) => setEditPostTitle(e.target.value)}
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div>
                <textarea
                  value={editPostContent}
                  onChange={(e) => setEditPostContent(e.target.value)}
                  rows={8}
                  maxLength={10000}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                />
              </div>
              {editPostError && (
                <p className="text-red-500 text-xs font-medium">{editPostError}</p>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditingPost(false)}
                  className="px-4 py-2 rounded-xl font-bold text-sm text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditPostSubmitting || !editPostTitle.trim() || !editPostContent.trim()}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEditPostSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0">
                  {post.author?.imageUrl ? (
                    <div
                      className="w-12 h-12 rounded-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${post.author.imageUrl})`,
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {post.isPinned && (
                      <span className="flex items-center gap-1 text-primary text-[10px] font-bold uppercase">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getCategoryColor(post.category)}`}
                    >
                      {getCategoryLabel(post.category)}
                    </span>
                    {post.campus && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {post.campus}
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold mb-1">
                    {post.title}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {post.author?.name || "Unknown"} &middot;{" "}
                    {getTimeAgo(post.createdAt)}
                  </p>
                </div>
              </div>

              <div className="text-sm leading-relaxed whitespace-pre-wrap mb-6 pl-0 md:pl-16">
                {post.content}
              </div>

              <div className="flex items-center gap-4 pl-0 md:pl-16 border-t border-gray-100 dark:border-border pt-4">
                <button
                  onClick={handleLikePost}
                  disabled={!isAuthenticated}
                  className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                    hasLiked
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${hasLiked ? "fill-primary" : ""}`}
                  />
                  {post.likeCount} {post.likeCount === 1 ? "Like" : "Likes"}
                </button>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  {post.replyCount} {post.replyCount === 1 ? "Reply" : "Replies"}
                </span>
                <div className="flex-1" />
                {isAdmin && (
                  <button
                    onClick={handleTogglePin}
                    className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                      post.isPinned
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <Pin className="w-4 h-4" />
                    {post.isPinned ? "Unpin" : "Pin"}
                  </button>
                )}
                {(isAuthor || isAdmin) && (
                  <button
                    onClick={openEditPost}
                    className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {(isAuthor || isAdmin) && (
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center gap-1.5 text-sm font-semibold text-accent-coral hover:text-accent-coral/80 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </article>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-4">
            {replies === undefined ? (
              <Loader2 className="h-4 w-4 animate-spin inline" />
            ) : (
              <>
                {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
              </>
            )}
          </h2>

          {replies === undefined ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : replies.length > 0 ? (
            <div className="space-y-3">
              {replies.map((reply) => {
                const isReplyAuthor =
                  currentUser && reply.authorId === currentUser._id;
                const isEditingThis = editingReplyId === reply._id;
                return (
                  <div
                    key={reply._id}
                    className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">
                        {reply.author?.imageUrl ? (
                          <div
                            className="w-9 h-9 rounded-full bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${reply.author.imageUrl})`,
                            }}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold">
                            {reply.author?.name || "Unknown"}
                          </span>
                          {reply.authorId === post.authorId && (
                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">
                              OP
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {getTimeAgo(reply.createdAt)}
                          </span>
                        </div>
                        {isEditingThis ? (
                          <form onSubmit={handleEditReplySubmit} className="space-y-3">
                            <textarea
                              value={editReplyContent}
                              onChange={(e) => setEditReplyContent(e.target.value)}
                              rows={3}
                              maxLength={5000}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                            />
                            {editReplyError && (
                              <p className="text-red-500 text-xs font-medium">{editReplyError}</p>
                            )}
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => setEditingReplyId(null)}
                                className="px-3 py-1.5 rounded-lg font-bold text-xs text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isEditReplySubmitting || !editReplyContent.trim()}
                                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-primary/90 transition-all disabled:opacity-50"
                              >
                                {isEditReplySubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2">
                              {reply.content}
                            </p>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleLikeReply(reply._id)}
                                disabled={!isAuthenticated}
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                {reply.likeCount}
                              </button>
                              {(isReplyAuthor || isAdmin) && (
                                <button
                                  onClick={() => openEditReply(reply._id, reply.content)}
                                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                              )}
                              {(isReplyAuthor || isAdmin) && (
                                <button
                                  onClick={() => handleDeleteReply(reply._id)}
                                  className="flex items-center gap-1 text-xs text-accent-coral hover:text-accent-coral/80 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border">
              <MessageCircle className="w-10 h-10 text-gray-300 dark:text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No replies yet. Be the first to respond!
              </p>
            </div>
          )}
        </section>

        {isAuthenticated && (
          <form
            onSubmit={handleReply}
            className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-4"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-1">
                {currentUser?.imageUrl ? (
                  <div
                    className="w-9 h-9 rounded-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${currentUser.imageUrl})`,
                    }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  rows={3}
                  maxLength={5000}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none mb-3"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !replyContent.trim()}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
