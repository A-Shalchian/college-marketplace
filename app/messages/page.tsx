"use client";

import { Suspense, useState } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { BottomNav } from "@/components/bottom-nav";
import Link from "next/link";
import {
  User,
  Loader2,
  MessageSquare,
  Search,
  Shield,
} from "lucide-react";

type FilterType = "all" | "buying" | "selling";

function MessagesContent() {
  const { user } = useUser();
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const currentUser = useQuery(api.users.getCurrentUser, {
    clerkId: user?.id,
  });
  const conversations = useQuery(
    api.messages.getUserConversations,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const filteredConversations = conversations?.filter((conv) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "buying" && conv.buyerId === currentUser?._id) ||
      (filter === "selling" && conv.sellerId === currentUser?._id);

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      conv.otherUser?.name?.toLowerCase().includes(query) ||
      conv.listing?.title?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
          <p className="text-gray-500">Please sign in to view messages</p>
          <Link
            href="/sign-in"
            className="inline-block mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold"
          >
            Sign In
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (conversations === undefined) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex h-[calc(100vh-64px)]">
        <aside className="w-full md:w-80 flex flex-col border-r border-gray-200 bg-white shrink-0">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">Conversations</h1>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-none bg-background py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  filter === "all"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("buying")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  filter === "buying"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Buying
              </button>
              <button
                onClick={() => setFilter("selling")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  filter === "selling"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Selling
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {filteredConversations && filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <Link
                  key={conv._id}
                  href={`/messages/${conv._id}`}
                  className="group relative flex items-center gap-4 px-3 py-4 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all"
                >
                  <div className="relative">
                    {conv.otherUser?.imageUrl ? (
                      <div
                        className="h-14 w-14 shrink-0 rounded-full bg-cover bg-center border-2 border-white"
                        style={{ backgroundImage: `url(${conv.otherUser.imageUrl})` }}
                      />
                    ) : (
                      <div className="h-14 w-14 shrink-0 rounded-full bg-primary/10 dark:bg-primary/20 border-2 border-white flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-accent-mint" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold truncate">
                        {conv.otherUser?.name}
                      </p>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-xs text-primary font-semibold truncate mb-1">
                      {conv.listing?.title}
                    </p>
                    {conv.lastMessage && (
                      <p className="text-xs text-gray-500 truncate">
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-16 px-4">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">
                  {filter === "all" && "No messages yet"}
                  {filter === "buying" && "No buying conversations"}
                  {filter === "selling" && "No selling conversations"}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {filter === "all" && "Start a conversation by contacting a seller"}
                  {filter === "buying" && "Browse listings and message sellers to buy items"}
                  {filter === "selling" && "Post a listing and wait for buyers to message you"}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-background/50">
            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
              <Shield className="w-4 h-4" />
              <span>Meet in public campus spots.</span>
            </div>
          </div>
        </aside>

        <section className="hidden md:flex flex-1 flex-col bg-white items-center justify-center">
          <div className="text-center px-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Your Messages</h2>
            <p className="text-gray-500 text-sm max-w-xs">
              Select a conversation from the sidebar to start chatting with buyers and sellers.
            </p>
          </div>
        </section>
      </div>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
