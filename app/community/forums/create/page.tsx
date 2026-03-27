"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  MessageSquareText,
  ChevronDown,
} from "lucide-react";

const categories = [
  { id: "general", label: "General" },
  { id: "course_help", label: "Course Help" },
  { id: "housing", label: "Housing" },
  { id: "campus_life", label: "Campus Life" },
];

const campuses = [
  { id: "", label: "No specific campus" },
  { id: "St. James Campus", label: "St. James Campus" },
  { id: "Casa Loma Campus", label: "Casa Loma Campus" },
  { id: "Waterfront Campus", label: "Waterfront Campus" },
];

function CreatePostContent() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const currentUser = useQuery(api.users.getCurrentUser);
  const createPost = useMutation(api.forums.createPost);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [campus, setCampus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSubmitting) return;

    setError("");

    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }
    if (content.trim().length < 10) {
      setError("Content must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const postId = await createPost({
        title: title.trim(),
        content: content.trim(),
        category,
        campus: campus || undefined,
      });
      router.push(`/community/forums/${postId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-[900px] mx-auto px-6 py-20 text-center">
          <p className="text-gray-500">Please sign in to create a post</p>
          <Link
            href="/sign-in"
            className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[700px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/community/forums"
            className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">New Discussion</h1>
            <p className="text-sm text-muted-foreground">Share something with the GBC community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind?"
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{title.length}/200</p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share details, ask a question, or start a discussion..."
                rows={8}
                maxLength={10000}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{content.length}/10,000</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Campus (optional)</label>
                <select
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 justify-end">
            <Link
              href="/community/forums"
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-muted-foreground hover:bg-gray-100 dark:hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageSquareText className="w-4 h-4" />
              )}
              {isSubmitting ? "Posting..." : "Post Discussion"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CreatePostContent />
    </Suspense>
  );
}
