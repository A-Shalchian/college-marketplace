"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import {
  Loader2,
  MessageSquareText,
  ThumbsUp,
  MessageCircle,
  Pin,
  Search,
  ArrowLeft,
  User,
  ChevronDown,
} from "lucide-react";

const forumCategories = [
  { id: "all", label: "All Topics" },
  { id: "general", label: "General" },
  { id: "course_help", label: "Course Help" },
  { id: "housing", label: "Housing" },
  { id: "campus_life", label: "Campus Life" },
];

function ForumsContent() {
  const { isAuthenticated } = useConvexAuth();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

  const currentUser = useQuery(api.users.getCurrentUser);
  const posts = useQuery(api.forums.getPosts, {
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  const likedPostIds = useQuery(
    api.forums.getUserLikedPostIds,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const filteredPosts = posts?.filter((post) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      post.content.toLowerCase().includes(q) ||
      post.author?.name?.toLowerCase().includes(q)
    );
  });

  const getCategoryLabel = (id: string) => {
    const labels: Record<string, string> = {
      general: "General",
      course_help: "Course Help",
      housing: "Housing",
      campus_life: "Campus Life",
    };
    return labels[id] || id;
  };

  const getCategoryColor = (id: string) => {
    const colors: Record<string, string> = {
      general: "bg-primary/10 text-primary",
      course_help: "bg-accent-mint/10 text-accent-mint",
      housing: "bg-accent-coral/10 text-accent-coral",
      campus_life: "bg-primary/10 text-[#4a8ebf]",
    };
    return colors[id] || "bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[900px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/community"
            className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Discussion Forums</h1>
            <p className="text-sm text-muted-foreground">Ask questions, share tips, connect with students</p>
          </div>
          {isAuthenticated && (
            <Link
              href="/community/forums/create"
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all"
            >
              New Post
            </Link>
          )}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border-none bg-white dark:bg-card py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none border border-gray-100 dark:border-border"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 hide-scrollbar">
          {forumCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground hover:bg-gray-200 dark:hover:bg-border"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {posts === undefined ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPosts && filteredPosts.length > 0 ? (
          <div className="space-y-3">
            {filteredPosts.map((post) => {
              const isLiked = likedPostIds?.includes(post._id) ?? false;
              return (
                <Link
                  key={post._id}
                  href={`/community/forums/${post._id}`}
                  className="block bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-border p-5 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 hidden md:block">
                      {post.author?.imageUrl ? (
                        <div
                          className="w-10 h-10 rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${post.author.imageUrl})` }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {post.isPinned && (
                          <Pin className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                        <h3 className="font-bold text-sm md:text-base truncate">{post.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getCategoryColor(post.category)}`}>
                          {getCategoryLabel(post.category)}
                        </span>
                        <span className="font-medium">{post.author?.name || "Unknown"}</span>
                        <span>{getTimeAgo(post.createdAt)}</span>
                        <span className={`flex items-center gap-1 ${isLiked ? "text-primary font-semibold" : ""}`}>
                          <ThumbsUp className="w-3.5 h-3.5" /> {post.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" /> {post.replyCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <MessageSquareText className="w-12 h-12 text-gray-300 dark:text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No discussions yet</p>
            <p className="text-muted-foreground/70 text-sm mt-1">Be the first to start a conversation!</p>
            {isAuthenticated && (
              <Link
                href="/community/forums/create"
                className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Create a Post
              </Link>
            )}
          </div>
        )}
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function ForumsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ForumsContent />
    </Suspense>
  );
}
